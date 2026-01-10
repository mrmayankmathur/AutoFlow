"use client";

import { useState, useCallback, useRef, useMemo } from "react";
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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { useTheme } from "next-themes";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NavigationControls } from "./navigation-control";
import { NodeType } from "@prisma/client";
import { ExecuteWorkflowButton } from "./execute-workflow-button";

// --- Configuration ---
const MIN_DISTANCE = 150; // Distance to trigger auto-connect
const defaultEdgeOptions: DefaultEdgeOptions = {
  interactionWidth: 75,
};

export const EditorLoading = () => {
  return <LoadingView message="Loading Editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

// --- Internal Canvas Component ---
const EditorCanvas = ({ workflow }: { workflow: any }) => {
  const { theme } = useTheme();
  const setEditor = useSetAtom(editorAtom);

  // Flow State
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const { updateEdge, getEdge, addEdges } = useReactFlow();
  const store = useStoreApi();

  // Refs for tracking drag state
  const overlappedEdgeRef = useRef<string | null>(null);
  const closestNodeRef = useRef<string | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  const onMove = useCallback(() => {
    lastMoveTimeRef.current = Date.now();
  }, []);

  // Standard Handlers
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  // --- Logic: Distance Calculation ---
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
        {
          distance: Number.MAX_VALUE,
          node: null as Node | null,
        }
      );

      return closestNode.node;
    },
    [store]
  );

  const { setCenter } = useReactFlow();

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (Date.now() - lastMoveTimeRef.current < 200) {
      return;
    }

    const width = node.measured?.width ?? node.width ?? 0;
    const height = node.measured?.height ?? node.height ?? 0;

    setCenter(node.position.x + width / 2, node.position.y + height / 2, {
      zoom: 1.2,
      duration: 800,
    });
  };

  const maskColor =
    theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(240, 240, 240, 0.6)";

  // --- Logic: Drag Handler (Intersection + Proximity) ---
  const onNodeDrag: OnNodeDrag = useCallback(
    (e, node) => {
      // --- 1. Edge Intersection Check ---
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

      // --- 2. Proximity Connect Check ---
      if (!isValidSplit) {
        const closeNode = getClosestNode(node);

        if (closeNode && closeNode.id !== closestNodeRef.current) {
          closestNodeRef.current = closeNode.id;

          setEdges((es) => {
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
            return [...es.filter((e) => e.id !== "temp-edge"), tempEdge];
          });
        } else if (!closeNode && closestNodeRef.current) {
          closestNodeRef.current = null;
          setEdges((es) => es.filter((e) => e.id !== "temp-edge"));
        }
      } else {
        if (closestNodeRef.current) {
          closestNodeRef.current = null;
          setEdges((es) => es.filter((e) => e.id !== "temp-edge"));
        }
      }
    },
    [updateEdge, getClosestNode, getEdge, setEdges]
  );

  // --- Logic: Drop Handler (Finalize) ---
  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, node) => {
      // Split Edge (Intersection)
      const overlappedId = overlappedEdgeRef.current;
      if (overlappedId) {
        const edge = getEdge(overlappedId);
        if (edge) {
          updateEdge(overlappedId, { target: node.id, style: {} });
          const nextId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${node.id}->${edge.target}`;
          addEdges({
            id: nextId,
            source: node.id,
            target: edge.target,
            type: edge.type,
            animated: edge.animated,
          });
        }
        overlappedEdgeRef.current = null;
        setEdges((es) => es.filter((e) => e.id !== "temp-edge"));
        return;
      }

      // Proximity Connect
      const closestId = closestNodeRef.current;
      if (closestId) {
        // --- RETRIEVE HANDLE IDs ---
        // We need to look up the internal node data to find the available handles.
        const internalNodeMap = store.getState().nodeLookup;
        const sourceNodeInternal = internalNodeMap.get(node.id);
        const targetNodeInternal = internalNodeMap.get(closestId);

        const sourceHandle =
          sourceNodeInternal?.internals?.handleBounds?.source?.[0]?.id ?? null;

        const targetHandle =
          targetNodeInternal?.internals?.handleBounds?.target?.[0]?.id ?? null;

        setEdges((es) => {
          const filtered = es.filter((e) => e.id !== "temp-edge");

          // Check for duplicates
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
    [getEdge, addEdges, updateEdge, store]
  );

  return (
    <div className="size-full dark:text-black! light:bg-[#FBFBFB]">
      <ReactFlow
        colorMode={(theme as ColorMode) || "system"}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
      >
        <Controls />
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
