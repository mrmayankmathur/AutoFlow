"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
  Workflow as WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { Workflow } from "@prisma/client";
import { cn } from "@/lib/utils";
import { EntityHeader, EntityPagination } from "@/components/entity-components";
import WorkflowButton from "@/components/global/workflow-button";

// --- Components ---

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const { modal } = useUpgradeModal();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {modal}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mt-5">Workflows</h2>
        <p className="text-muted-foreground mt-1">
          Manage and automate your tasks efficiently.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <WorkflowButton />
      </div>
    </div>
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  if (workflows.data.items.length === 0) {
    return <WorkflowsEmpty />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.data.items.map((workflow) => (
          <WorkflowCard key={workflow.id} data={workflow} />
        ))}
      </div>
      <WorkflowsPagination />
    </div>
  );
};

// Helper to generate a consistent gradient based on string length/char codes
const getGradient = (id: string) => {
  const gradients = [
    "from-pink-500 via-red-500 to-yellow-500",
    "from-blue-400 via-indigo-500 to-purple-500",
    "from-green-400 via-emerald-500 to-teal-500",
    "from-orange-400 via-amber-500 to-yellow-500",
    "from-rose-400 via-fuchsia-500 to-indigo-500",
  ];
  const index = id.charCodeAt(0) % gradients.length;
  return gradients[index];
};

export const WorkflowCard = ({ data }: { data: Workflow }) => {
  const removeWorkflow = useRemoveWorkflow();
  const router = useRouter();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    removeWorkflow.mutate({ id: data.id });
  };

  const gradient = getGradient(data.id);

  return (
    <Card
      className="group relative flex flex-col overflow-hidden border transition-all hover:shadow-md cursor-pointer hover:scale-[1.01] duration-150 mt-2"
      onClick={() => router.push(`/workflows/${data.id}`)}
    >
      {/* Visual Header */}
      <div
        className={cn(
          "h-24 w-full bg-linear-to-r dark:opacity-50 opacity-65 dark:group-hover:opacity-80 group-hover:opacity-100 transition-opacity",
          gradient
        )}
      />

      <CardHeader className="relative -mt-10 -mb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-sm">
          <WorkflowIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4 truncate text-lg font-semibold leading-none tracking-tight">
          {data.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {/* Placeholder for description if you add it later to DB */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          Automated workflow created on{" "}
          {new Date(data.createdAt).toLocaleDateString()}.
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 pb-3">
        <div className="text-xs text-muted-foreground -mt-2">
          Edited {formatDistanceToNow(data.updatedAt)} ago
        </div>

        <div className="-mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/workflows/${data.id}`);
                }}
              >
                <Play className="mr-2 h-4 w-4" /> Open
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleRemove}
                disabled={removeWorkflow.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    <div className="mt-8">
      <EntityPagination
        disabled={workflows.isFetching}
        totalPages={workflows.data.totalPages}
        page={workflows.data.page}
        onPageChange={(page) => {
          setParams({ ...params, page });
        }}
      />
    </div>
  );
};

export const WorkflowsEmpty = () => {
  const { modal } = useUpgradeModal();

  return (
    <>
      {modal}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <WorkflowIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No workflows created</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          You haven't created any workflows yet. Start automating your tasks by
          creating your first workflow.
        </p>
        <WorkflowButton />
      </div>
    </>
  );
};

export const WorkflowsLoading = () => {
  return (
    <div className="space-y-6 p-1">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm h-[200px]"
          >
            <div className="h-24 w-full bg-muted rounded-t-xl" />
            <div className="p-6 pt-0 space-y-2">
              <Skeleton className="h-12 w-12 rounded-xl -mt-6 mb-4 border bg-card" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WorkflowsError = () => {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <WorkflowIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="text-muted-foreground">
        We couldn't load your workflows. Please try again later.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  );
};
