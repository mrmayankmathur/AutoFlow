"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/global/sidebar";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarActionButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export const SidebarActionButton = ({
  onClick,
  children,
  className,
}: SidebarActionButtonProps) => {
  const { open } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "group flex h-10 items-center rounded-lg transition-colors",
              open ? "gap-x-4 px-4" : "justify-center px-4 -mx-1",
              "hover:bg-neutral-200 dark:hover:bg-neutral-700",
              className
            )}
          >
            {children}
          </button>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
