"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { memo, type ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}

export const WorkflowNode = memo(
  ({
    children,
    showToolbar = true,
    onDelete,
    onSettings,
    name,
    description,
  }: WorkflowNodeProps) => {
    return (
      <>
        {showToolbar && (
          <NodeToolbar>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSettings}
              className="text-muted-foreground dark:hover:text-white"
              aria-label="Settings"
            >
              <SettingsIcon className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-muted-foreground dark:hover:text-white"
              aria-label="Delete"
            >
              <TrashIcon className="size-4" />
            </Button>
          </NodeToolbar>
        )}
        {children}
        {name && (
          <NodeToolbar
            position={Position.Bottom}
            isVisible
            className="max-w-[200px] text-center"
          >
            <p className="font-medium dark:text-white">{name}</p>
            {description && (
              <p className="text-muted-foreground truncate text-xs">
                {description}
              </p>
            )}
          </NodeToolbar>
        )}
      </>
    );
  },
);

WorkflowNode.displayName = "WorkflowNode";
