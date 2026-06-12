"use client";

import {
  useReactFlow,
  type Node,
  type NodeProps,
  Position,
} from "@xyflow/react";
import { memo, useCallback, useState, useMemo } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { AiClassifierFormValues, AiClassifierDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { AI_CLASSIFIER_CHANNEL_NAME } from "@/inngest/channels/ai-classifier";
import { fetchAiClassifierRealtimeToken } from "./actions";
import { BaseHandle } from "@/components/react-flow/base-handle";

type AiClassifierNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  routes?: Array<{ id: string; label: string }>;
  input?: string;
};

type AiClassifierNodeType = Node<AiClassifierNodeData>;

export const AiClassifierNode = memo(
  (props: NodeProps<AiClassifierNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const routes = nodeData?.routes || [];
    const description = useMemo(() => {
      return routes.length > 0
        ? `Router: ${routes.map((r) => r.label).join(", ")}`
        : "Not configured";
    }, [routes]);

    const handleSubmit = useCallback(
      (values: AiClassifierFormValues) => {
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
          })
        );
        setDialogOpen(false);
      },
      [props.id, setNodes]
    );

    const handleOpenSettings = useCallback(() => {
      setDialogOpen(true);
    }, []);

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: AI_CLASSIFIER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchAiClassifierRealtimeToken,
    });

    return (
      <>
        <AiClassifierDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/aiClassifier.png"
          name="Smart Router"
          description={description}
          status={nodeStatus.status}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
          hideSourceHandle={true}
        >
          <div className="flex flex-col gap-3 mt-2">
            {routes.map((route, index) => (
              <div
                key={route.id}
                className="relative flex items-center justify-end h-6"
              >
                <span className="mr-3 text-xs text-muted-foreground whitespace-nowrap pointer-events-none">
                  {route.label}
                </span>
                <BaseHandle
                  id={`route-${route.id}`}
                  type="source"
                  position={Position.Right}
                  style={{ top: "50%" }}
                  className="bg-blue-500! border-blue-600!"
                />
              </div>
            ))}
            <div className="relative flex items-center justify-end h-6">
              <span className="mr-3 text-xs text-muted-foreground whitespace-nowrap pointer-events-none">
                Default
              </span>
              <BaseHandle
                id="source-1"
                type="source"
                position={Position.Right}
                style={{ top: "50%" }}
                className="bg-blue-500! border-blue-600!"
              />
            </div>
          </div>
        </BaseExecutionNode>
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
  }
);

AiClassifierNode.displayName = "AiClassifierNode";
