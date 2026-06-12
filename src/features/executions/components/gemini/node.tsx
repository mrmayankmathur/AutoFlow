"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGeminiRealtimeToken } from "./actions";
import { GeminiDialog, type GeminiFormValues } from "./dialog";

type GeminiNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo(
  (props: NodeProps<GeminiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = useMemo(() => {
      return nodeData?.userPrompt
        ? `${nodeData.model || "gemini-3-flash-preview"}: ${nodeData.userPrompt.slice(0, 50)}...`
        : "Not configured";
    }, [nodeData?.userPrompt, nodeData?.model]);

    const handleSubmit = useCallback(
      (values: GeminiFormValues) => {
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === props.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...values,
                },
              };
            }
            return node;
          }),
        );
        setDialogOpen(false);
      },
      [props.id, setNodes],
    );

    const handleOpenSettings = useCallback(() => {
      setDialogOpen(true);
    }, []);

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: GEMINI_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchGeminiRealtimeToken,
    });

    return (
      <>
        <GeminiDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/gemini.svg"
          name="Gemini"
          description={description}
          status={nodeStatus.status}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.selected === next.selected &&
      prev.dragging === next.dragging &&
      prev.positionAbsoluteX === next.positionAbsoluteX &&
      prev.positionAbsoluteY === next.positionAbsoluteY &&
      JSON.stringify(prev.data) === JSON.stringify(next.data)
    );
  },
);

GeminiNode.displayName = "GeminiNode";
