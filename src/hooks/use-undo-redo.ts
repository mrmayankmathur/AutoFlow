import { useCallback, useState } from "react";
import { Edge, Node } from "@xyflow/react";

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

export const useUndoRedo = (initialNodes: Node[], initialEdges: Edge[]) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  const takeSnapshot = useCallback(() => {
    // Save the CURRENT state to history
    setPast((past) => [...past, { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((future) => [{ nodes, edges }, ...future]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setPast(newPast);
  }, [nodes, edges, past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((past) => [...past, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setFuture(newFuture);
  }, [nodes, edges, future]);

  return {
    nodes,
    setNodes,
    onNodesChange: setNodes, // specialized setter not needed
    edges,
    setEdges,
    onEdgesChange: setEdges,
    undo,
    redo,
    takeSnapshot,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};
