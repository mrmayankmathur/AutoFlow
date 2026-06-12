"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchSlackRealtimeToken } from "./actions";
import { SlackDialog, type SlackFormValues } from "./dialog";

type SlackNodeData = {
  webhookUrl?: string;
  content?: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo(
  (props: NodeProps<SlackNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = useMemo(() => {
      return nodeData?.content
        ? `Send ${nodeData.content.slice(0, 50)}...`
        : "Not configured";
    }, [nodeData?.content]);

    const handleSubmit = useCallback(
      (values: SlackFormValues) => {
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
      channel: SLACK_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchSlackRealtimeToken,
    });

    return (
      <>
        <SlackDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/slack.svg"
          name="Slack"
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

SlackNode.displayName = "SlackNode";
