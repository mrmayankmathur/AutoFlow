"use client";

import React, { useEffect, useState } from "react";
import { getRecentExecutions } from "@/actions/user-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Execution = {
  id: string;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
  workflow: {
    name: string;
  };
};

export const NotificationsSettings = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getRecentExecutions(20);
        if (result.success && result.data) {
          setExecutions(result.data as any);
        } else {
          toast.error("Failed to load activity log");
        }
      } catch (e) {
        toast.error("Error loading activity");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "RUNNING":
        return <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Activity className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getDuration = (start: Date | string, end: Date | string | null) => {
    if (!end) return "Running...";
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = e - s;
    if (diff < 1000) return `${diff}ms`;
    return `${(diff / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="lg:max-h-[55vh] bg-white dark:bg-[#15161d] border-neutral-200/60 dark:border-neutral-800 shadow-sm border h-[calc(100vh-16rem)] flex flex-col">
        <CardContent className="flex-1 min-h-0 p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
              <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Activity className="h-6 w-6 opacity-50" />
              </div>
              <p>No recent activity found.</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {executions.map((exec) => (
                  <div
                    key={exec.id}
                    className="p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors flex items-start gap-4"
                  >
                    <div
                      className={cn(
                        "mt-1 h-8 w-8 rounded-full flex items-center justify-center border shrink-0",
                        exec.status === "SUCCESS" &&
                          "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30",
                        exec.status === "FAILED" &&
                          "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30",
                        exec.status === "RUNNING" &&
                          "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30"
                      )}
                    >
                      {getStatusIcon(exec.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {exec.workflow.name}
                        </p>
                        <span className="text-xs text-neutral-400 shrink-0 tabular-nums">
                          {new Date(exec.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-500">
                          {exec.status === "FAILED"
                            ? "Workflow failed to complete"
                            : exec.status === "SUCCESS"
                              ? "Workflow completed successfully"
                              : "Execution in progress"}
                        </p>
                        <span className="text-xs font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                          {getDuration(exec.startedAt, exec.completedAt)}
                        </span>
                      </div>
                      {exec.error && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20 font-mono break-all">
                          Error: {exec.error.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
