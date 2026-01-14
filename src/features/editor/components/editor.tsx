"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Controls,
  MiniMap,
  Background,
  ColorMode,
  Panel,
  type OnNodeDrag,
  type DefaultEdgeOptions,
  SelectionMode,
  getOutgoers,
} from "@xyflow/react";
import { Undo, Redo } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { useTheme } from "next-themes";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NavigationControls } from "./navigation-control";
import { NodeType } from "@prisma/client";
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { Button } from "@/components/ui/button";

const MIN_DISTANCE = 150;
const defaultEdgeOptions: DefaultEdgeOptions = {
  interactionWidth: 75,
};

export const EditorLoading = () => <LoadingView message="Loading Editor..." />;
export const EditorError = () => <ErrorView message="Error loading editor" />;

const EditorCanvas = ({ workflow }: { workflow: any }) => {
  const { theme } = useTheme();
  const setEditor = useSetAtom(editorAtom);

  // --- Hook Integration ---
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    undo,
    redo,
    takeSnapshot,
    canUndo,
    canRedo,
  } = useUndoRedo(workflow.nodes, workflow.edges);

  const { updateEdge, getEdge, addEdges, getNodes, getEdges } = useReactFlow();
  const store = useStoreApi();

  // Refs
  const overlappedEdgeRef = useRef<string | null>(null);
  const closestNodeRef = useRef<string | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [pasteCount, setPasteCount] = useState(0);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isInputFocused) return;

      if (event.ctrlKey || event.metaKey) {
        // --- UNDO ---
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          undo();
        }

        // --- REDO ---
        if ((event.key === "z" && event.shiftKey) || event.key === "y") {
          event.preventDefault();
          redo();
        }

        // --- COPY ---
        if (event.key === "c") {
          event.preventDefault();
          setPasteCount(0);
          const selectedNodes = getNodes().filter((node) => node.selected);

          if (selectedNodes.length > 0) {
            // Find edges that connect two selected nodes (internal edges)
            const selectedNodeIds = selectedNodes.map((node) => node.id);
            const internalEdges = getEdges().filter(
              (edge) =>
                selectedNodeIds.includes(edge.source) &&
                selectedNodeIds.includes(edge.target)
            );

            clipboardRef.current = {
              nodes: selectedNodes.map((node) => ({ ...node })),
              edges: internalEdges.map((edge) => ({ ...edge })),
            };
          }
        }

        // --- PASTE ---
        if (event.key === "v" && clipboardRef.current) {
          event.preventDefault();
          takeSnapshot();

          setPasteCount((prev) => prev + 1);
          const currentOffset = (pasteCount + 1) * 50;

          const { nodes: copiedNodes, edges: copiedEdges } =
            clipboardRef.current;

          // Map to track old ID -> new ID
          const idMap = new Map<string, string>();

          // 1. Create New Nodes with Offset
          const newNodes = copiedNodes.map((node) => {
            const newId = crypto.randomUUID
              ? crypto.randomUUID()
              : `${node.id}_copy_${Date.now()}`;
            idMap.set(node.id, newId);

            return {
              ...node,
              id: newId,
              position: {
                x: node.position.x + currentOffset,
                y: node.position.y + currentOffset,
              },
              selected: true,
              data: structuredClone(node.data),
            };
          });

          // 2. Create New Edges (Using reduce to avoid null types)
          const newEdges = copiedEdges.reduce<Edge[]>((acc, edge) => {
            const newSource = idMap.get(edge.source);
            const newTarget = idMap.get(edge.target);

            if (newSource && newTarget) {
              const newEdge: Edge = {
                ...edge,
                id: crypto.randomUUID
                  ? crypto.randomUUID()
                  : `edge_${newSource}_${newTarget}`,
                source: newSource,
                target: newTarget,
                selected: true,
              };
              acc.push(newEdge);
            }
            return acc;
          }, []);

          // 3. Update State (Deselect old, Add new)
          setNodes((node) => [
            ...node.map((node) => ({ ...node, selected: false })),
            ...newNodes,
          ]);
          setEdges((edge) => [
            ...edge.map((edge) => ({ ...edge, selected: false })),
            ...newEdges,
          ]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, takeSnapshot, getNodes, getEdges, setNodes, setEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const isStructureChange = changes.some(
        (c) => c.type === "remove" || c.type === "add"
      );

      if (isStructureChange) {
        takeSnapshot();
      }

      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
    },
    [takeSnapshot, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const isStructureChange = changes.some(
        (c) => c.type === "remove" || c.type === "add"
      );

      if (isStructureChange) {
        takeSnapshot();
      }
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
    },
    [takeSnapshot, setEdges]
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    },
    [takeSnapshot, setEdges]
  );

  // --- Helpers & Visual Logic ---
  const onMove = useCallback(() => {
    lastMoveTimeRef.current = Date.now();
  }, []);

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  const getClosestNode = useCallback(
    (node: Node) => {
      const internalNodes = Array.from(store.getState().nodeLookup.values());
      const closestNode = internalNodes.reduce(
        (res, n) => {
          if (n.id !== node.id) {
            const dx = n.internals.positionAbsolute.x - node.position.x;
            const dy = n.internals.positionAbsolute.y - node.position.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < res.distance && d < MIN_DISTANCE) {
              res.distance = d;
              res.node = n;
            }
          }
          return res;
        },
        { distance: Number.MAX_VALUE, node: null as Node | null }
      );
      return closestNode.node;
    },
    [store]
  );

  const { setCenter } = useReactFlow();
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (Date.now() - lastMoveTimeRef.current < 200) return;
    const width = node.measured?.width ?? node.width ?? 0;
    const height = node.measured?.height ?? node.height ?? 0;
    setCenter(node.position.x + width / 2, node.position.y + height / 2, {
      zoom: 1.2,
      duration: 800,
    });
  };

  const maskColor =
    theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(240, 240, 240, 0.6)";

  const onNodeDrag: OnNodeDrag = useCallback(
    (e, node) => {
      const nodeDiv = document.querySelector(
        `.react-flow__node[data-id="${node.id}"]`
      );
      if (!nodeDiv) return;

      const rect = nodeDiv.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const edgeFoundElement = document
        .elementsFromPoint(centerX, centerY)
        .find((el) =>
          el.classList.contains("react-flow__edge-interaction")
        )?.parentElement;

      const edgeId = edgeFoundElement?.dataset.id;
      const targetEdge = edgeId ? getEdge(edgeId) : null;

      const isValidSplit =
        targetEdge &&
        edgeId !== "temp-edge" &&
        targetEdge.source !== node.id &&
        targetEdge.target !== node.id;

      if (isValidSplit && edgeId) {
        updateEdge(edgeId, {
          style: {
            stroke: "var(--xy-theme-edge-hover, #727272)",
            strokeWidth: 2,
          },
        });
        overlappedEdgeRef.current = edgeId;
      } else if (overlappedEdgeRef.current) {
        updateEdge(overlappedEdgeRef.current, { style: {} });
        overlappedEdgeRef.current = null;
      }

      if (!isValidSplit) {
        const closeNode = getClosestNode(node);
        if (closeNode && closeNode.id !== closestNodeRef.current) {
          closestNodeRef.current = closeNode.id;
          setEdges((edges) => {
            const tempEdge: Edge = {
              id: "temp-edge",
              source: node.id,
              target: closeNode.id,
              animated: true,
              style: {
                strokeDasharray: "5, 5",
                stroke: "#555",
                pointerEvents: "none",
              },
              type: "default",
            };
            return [
              ...edges.filter((edge) => edge.id !== "temp-edge"),
              tempEdge,
            ];
          });
        } else if (!closeNode && closestNodeRef.current) {
          closestNodeRef.current = null;
          setEdges((edges) => edges.filter((edge) => edge.id !== "temp-edge"));
        }
      } else {
        if (closestNodeRef.current) {
          closestNodeRef.current = null;
          setEdges((edges) => edges.filter((edge) => edge.id !== "temp-edge"));
        }
      }
    },
    [updateEdge, getClosestNode, getEdge, setEdges]
  );

  const getClosestHandle = useCallback(
    (
      nodeInternal: any,
      otherNodePos: { x: number; y: number },
      handleType: "source" | "target"
    ) => {
      const handles = nodeInternal?.internals?.handleBounds?.[handleType];
      if (!handles || handles.length === 0) return null;
      if (handles.length === 1) return handles[0].id;

      let closestHandleId = null;
      let minDistance = Number.MAX_VALUE;

      const nodeX = nodeInternal.internals?.positionAbsolute?.x ?? 0;
      const nodeY = nodeInternal.internals?.positionAbsolute?.y ?? 0;

      for (const handle of handles) {
        // Handle position is relative to the node
        const handleX = nodeX + handle.x + handle.width / 2;
        const handleY = nodeY + handle.y + handle.height / 2;

        const dx = handleX - otherNodePos.x;
        const dy = handleY - otherNodePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          closestHandleId = handle.id;
        }
      }

      return closestHandleId;
    },
    []
  );

  const getNodeCenter = useCallback((nodeInternal: any) => {
    return {
      x:
        (nodeInternal?.internals?.positionAbsolute?.x ?? 0) +
        (nodeInternal?.measured?.width ?? nodeInternal?.width ?? 0) / 2,
      y:
        (nodeInternal?.internals?.positionAbsolute?.y ?? 0) +
        (nodeInternal?.measured?.height ?? nodeInternal?.height ?? 0) / 2,
    };
  }, []);

  // --- Cycle Detection Helper ---
  const isCyclic = useCallback(
    (source: string, target: string) => {
      const nodes = getNodes();
      const edges = getEdges();

      // 1. Prevent connecting to self
      if (source === target) return true;

      // 2. Find target node to start traversal
      const targetNode = nodes.find((n) => n.id === target);
      if (!targetNode) return false; // Should not happen, but safe to return false

      // 3. Check for cycles (DFS)
      const checkPath = (node: Node, visited = new Set<string>()) => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === source) return true; // Cycle detected
          if (checkPath(outgoer, visited)) return true;
        }
        return false;
      };

      return checkPath(targetNode);
    },
    [getNodes, getEdges]
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, node) => {
      // Handle Split Edge (Intersection)
      const overlappedId = overlappedEdgeRef.current;
      if (overlappedId) {
        const edge = getEdge(overlappedId);
        if (edge) {
          const internalNodeMap = store.getState().nodeLookup;
          const newNodeInternal = internalNodeMap.get(node.id);
          const sourceNodeInternal = internalNodeMap.get(edge.source);
          const targetNodeInternal = internalNodeMap.get(edge.target);

          // Get positions for distance calculation
          // Get positions for distance calculation
          const newNodePos = getNodeCenter(newNodeInternal);

          const sourceNodePos = getNodeCenter(sourceNodeInternal);

          const targetNodePos = getNodeCenter(targetNodeInternal);

          // Find closest input handle on NEW node (from source node)
          const newNodeInputHandle = getClosestHandle(
            newNodeInternal,
            sourceNodePos,
            "target"
          );

          // Find closest output handle on NEW node (to target node)
          const newNodeOutputHandle = getClosestHandle(
            newNodeInternal,
            targetNodePos,
            "source"
          );

          updateEdge(overlappedId, {
            target: node.id,
            targetHandle: newNodeInputHandle,
            style: {},
          });

          const nextId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${node.id}->${edge.target}`;

          addEdges({
            id: nextId,
            source: node.id,
            sourceHandle: newNodeOutputHandle,
            target: edge.target,
            targetHandle: edge.targetHandle,
            type: edge.type,
            animated: edge.animated,
          });
        }
        overlappedEdgeRef.current = null;
        setEdges((es) => es.filter((e) => e.id !== "temp-edge"));
        return;
      }

      // Handle Proximity Connect
      const closestId = closestNodeRef.current;
      if (closestId) {
        if (isCyclic(node.id, closestId)) {
          // If cyclic, clean up temp edge and abort
          closestNodeRef.current = null;
          setEdges((es) => es.filter((e) => e.id !== "temp-edge"));
          return;
        }

        const internalNodeMap = store.getState().nodeLookup;
        const sourceNodeInternal = internalNodeMap.get(node.id);
        const targetNodeInternal = internalNodeMap.get(closestId);

        const targetNodePos = getNodeCenter(targetNodeInternal);
        const sourceNodePos = getNodeCenter(sourceNodeInternal);

        const sourceHandle = getClosestHandle(
          sourceNodeInternal,
          targetNodePos,
          "source"
        );

        const targetHandle = getClosestHandle(
          targetNodeInternal,
          sourceNodePos,
          "target"
        );

        setEdges((es) => {
          const filtered = es.filter((e) => e.id !== "temp-edge");
          const alreadyConnected = filtered.some(
            (e) =>
              e.source === node.id &&
              e.target === closestId &&
              (e.sourceHandle === sourceHandle ||
                (!e.sourceHandle && !sourceHandle)) &&
              (e.targetHandle === targetHandle ||
                (!e.targetHandle && !targetHandle))
          );

          if (alreadyConnected) return filtered;

          const nextId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${node.id}->${closestId}`;
          return [
            ...filtered,
            {
              id: nextId,
              source: node.id,
              target: closestId,
              sourceHandle: sourceHandle,
              targetHandle: targetHandle,
              type: "default",
            },
          ];
        });
        closestNodeRef.current = null;
      }
    },
    [
      getEdge,
      addEdges,
      updateEdge,
      store,
      setEdges,
      getClosestHandle,
      isCyclic,
      getNodeCenter,
    ]
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) return false;

      // If isCyclic returns true, the connection is INVALID
      return !isCyclic(connection.source, connection.target);
    },
    [isCyclic]
  );

  return (
    <div className="size-full dark:text-black! light:bg-[#FBFBFB] relative">
      <ReactFlow
        colorMode={(theme as ColorMode) || "system"}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
        proOptions={{ hideAttribution: true }}
        panActivationKeyCode="Space"
        selectionMode={SelectionMode.Partial}
        onMove={onMove}
        isValidConnection={isValidConnection}
      >
        <Controls className="pb-13" />
        <MiniMap
          position="top-left"
          pannable={true}
          zoomable={true}
          onNodeClick={onNodeClick}
          nodeColor={(node) => {
            if (node.data.hasError) return "#ff0000";
            if (node.selected) return "#9faaf4";
            return "#B1B1B7";
          }}
          maskColor={maskColor}
          style={{
            height: 120,
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
          }}
        />
        <Background />
        <NavigationControls />

        {/* Undo/Redo Controls */}
        <Panel position="bottom-left" className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={undo}
            disabled={!canUndo}
            className="bg-background/80 text-black/50 dark:text-muted-foreground hover:text-black hover:dark:text-white backdrop-blur-sm transition-colors duration-150"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={redo}
            disabled={!canRedo}
            className="bg-background/80 text-black/50 dark:text-muted-foreground hover:text-black hover:dark:text-white backdrop-blur-sm transition-colors duration-150"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="size-4" />
          </Button>
        </Panel>

        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflow.id} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  return (
    <ReactFlowProvider>
      <EditorCanvas workflow={workflow} />
    </ReactFlowProvider>
  );
};
