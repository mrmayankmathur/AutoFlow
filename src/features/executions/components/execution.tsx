"use client";

import { ExecutionStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CopyIcon,
  Loader2Icon,
  TimerIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuspenseExecution } from "@/features/executions/hooks/use-executions";

const GetStatusIcon = ({ status }: { status: ExecutionStatus }) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return (
        <CheckCircle2Icon className="size-6 text-emerald-600 dark:text-emerald-400" />
      );
    case ExecutionStatus.FAILED:
      return (
        <XCircleIcon className="size-6 text-rose-600 dark:text-rose-400" />
      );
    case ExecutionStatus.RUNNING:
      return (
        <Loader2Icon className="animate-spin size-6 text-blue-600 dark:text-blue-400" />
      );
    default:
      return (
        <ClockIcon className="size-6 text-amber-600 dark:text-amber-400" />
      );
  }
};

const GetStatusBadge = ({ status }: { status: ExecutionStatus }) => {
  const variants: Partial<
    Record<
      ExecutionStatus,
      {
        variant: "default" | "destructive" | "outline" | "secondary";
        className: string;
      }
    >
  > = {
    [ExecutionStatus.SUCCESS]: {
      variant: "default",
      className:
        "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:border-emerald-800",
    },
    [ExecutionStatus.FAILED]: {
      variant: "destructive",
      className:
        "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 dark:border-rose-800",
    },
    [ExecutionStatus.RUNNING]: {
      variant: "default",
      className:
        "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 dark:border-blue-800",
    },
  };

  const config = variants[status] ?? {
    variant: "secondary",
    className:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800",
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      onClick={onCopy}
    >
      {copied ? (
        <CheckIcon className="size-4.5 text-green-600" />
      ) : (
        <CopyIcon className="size-4.5" />
      )}
    </Button>
  );
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);
  const router = useRouter();

  const duration = execution.completedAt
    ? Math.round(
        (execution.completedAt.getTime() - execution.startedAt.getTime()) /
          1000,
      )
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
      </div>

      <Card className="border-2 shadow-lg shadow-slate-200/50 dark:shadow-slate-950 overflow-hidden">
        <CardHeader className="pb-4 pt-8 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <GetStatusIcon status={execution.status} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-bold">
                    Execution Details
                  </CardTitle>
                  <GetStatusBadge status={execution.status} />
                </div>
                <CardDescription className="text-base">
                  Workflow execution for{" "}
                  <Link
                    prefetch
                    href={`/workflows/${execution.workflow.id}`}
                    className="font-semibold text-primary hover:underline underline-offset-4"
                  >
                    {execution.workflow.name}
                  </Link>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-950">
                  <ZapIcon className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Workflow
                </p>
              </div>
              <Link
                prefetch
                href={`/workflows/${execution.workflow.id}`}
                className="text-base font-medium text-primary hover:underline underline-offset-4 inline-block ml-1 mt-3"
              >
                {execution.workflow.name}
              </Link>
            </div>

            <div className="p-4 rounded-lg border bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-950">
                  <CalendarIcon className="size-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Started
                </p>
              </div>
              <p className="text-base font-medium text-slate-900 dark:text-slate-100 ml-1">
                {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                {execution.startedAt.toLocaleString()}
              </p>
            </div>

            {execution.completedAt && (
              <div className="p-4 rounded-lg border bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-950">
                    <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Completed
                  </p>
                </div>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {formatDistanceToNow(execution.completedAt, {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {execution.completedAt.toLocaleString()}
                </p>
              </div>
            )}

            {duration !== null && (
              <div className="p-4 rounded-lg border bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-950">
                    <TimerIcon className="size-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Duration
                  </p>
                </div>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {formatDuration(duration)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total execution time
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Event ID
            </p>
            <code className="text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 px-3 py-1.5 rounded border dark:border-slate-700">
              {execution.inngestEventId}
            </code>
          </div>

          {execution.error && (
            <div className="rounded-lg border-2 border-rose-200 dark:border-rose-900 bg-linear-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 overflow-hidden">
              <div className="p-4 bg-rose-100/50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-rose-200 dark:bg-rose-900">
                      <AlertTriangleIcon className="size-5 text-rose-700 dark:text-rose-300" />
                    </div>
                    <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">
                      Execution Error
                    </h3>
                  </div>
                  <div className="mr-px">
                    <CopyButton
                      text={`Execution Error: ${execution.error}\n\n${execution.errorStack || ""}`}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-rose-900 dark:text-rose-200 mb-2">
                    Error Message
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-md border border-rose-200 dark:border-rose-900">
                    <p className="text-sm text-rose-800 dark:text-rose-300 font-mono wrap-break-word">
                      {execution.error}
                    </p>
                  </div>
                </div>
                {execution.errorStack && (
                  <Collapsible
                    open={showStackTrace}
                    onOpenChange={setShowStackTrace}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-900 dark:hover:text-rose-200"
                      >
                        <span className="font-medium">
                          {showStackTrace
                            ? "Hide Stack Trace"
                            : "Show Stack Trace"}
                        </span>
                        {showStackTrace ? (
                          <ChevronUpIcon className="size-4" />
                        ) : (
                          <ChevronDownIcon className="size-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="p-3 bg-white dark:bg-slate-950 rounded-md border border-rose-200 dark:border-rose-900 max-h-96 overflow-auto">
                        <pre className="text-xs text-rose-800 dark:text-rose-300 font-mono whitespace-pre-wrap wrap-break-word">
                          {execution.errorStack}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          )}

          {execution.output && (
            <div className="rounded-lg border-2 border-emerald-200 dark:border-emerald-900 bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 overflow-hidden">
              <div className="p-4 bg-emerald-100/50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-900">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-200 dark:bg-emerald-900">
                      <CheckCircle2Icon className="size-5 text-emerald-700 dark:text-emerald-300" />
                    </div>
                    <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                      Execution Output
                    </h3>
                  </div>
                  <div className="mr-px">
                    <CopyButton
                      text={JSON.stringify(execution.output, null, 2)}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="p-3 bg-white dark:bg-slate-950 rounded-md border border-emerald-200 dark:border-emerald-900 max-h-96 overflow-auto">
                  <pre className="text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap wrap-break-word">
                    {JSON.stringify(execution.output, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const ExecutionLoading = () => {
  return (
    <div>
      <div className="absolute top-[67px] left-[71.5px] right-px h-[6px] bg-slate-200 dark:bg-slate-800 overflow-hidden z-1">
        <div className="h-full w-full bg-[linear-gradient(to_right,var(--color-blue-500),var(--color-purple-500),var(--color-pink-500),var(--color-blue-500))] animate-gradient-shift" />
      </div>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-20" />
        </div>

        <Card className="border-2 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden">
          <CardHeader className="pb-4 pt-8 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="size-6 rounded-full mt-1" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-7 w-full max-w-md" />
            </div>

            <div className="rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-md" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-md" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
