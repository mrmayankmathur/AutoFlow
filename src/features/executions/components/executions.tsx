"use client";

import type { Execution } from "@prisma/client";
import { ExecutionStatus } from "@prisma/client";
import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  HashIcon,
  Loader2Icon,
  TimerIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import {
  EmptyView2,
  EntityHeader,
  EntityPagination,
  ErrorView,
} from "@/components/entity-components";
import { cn } from "@/lib/utils";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";

const StatusBadge = ({ status }: { status: ExecutionStatus }) => {
  const styles = {
    [ExecutionStatus.SUCCESS]:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    [ExecutionStatus.FAILED]: "bg-red-50 text-red-700 border-red-200",
    [ExecutionStatus.RUNNING]:
      "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
    PENDING: "bg-slate-50 text-slate-700 border-slate-200", // Fallback
  };

  const icons = {
    [ExecutionStatus.SUCCESS]: (
      <CheckCircle2Icon className="w-3.5 h-3.5 mr-1.5" />
    ),
    [ExecutionStatus.FAILED]: <XCircleIcon className="w-3.5 h-3.5 mr-1.5" />,
    [ExecutionStatus.RUNNING]: (
      <Loader2Icon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
    ),
    PENDING: <ClockIcon className="w-3.5 h-3.5 mr-1.5" />,
  };

  const currentStyle = styles[status] || styles["PENDING"];
  const currentIcon = icons[status] || icons["PENDING"];
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        currentStyle,
      )}
    >
      {currentIcon}
      {label}
    </div>
  );
};

const DurationDisplay = ({ start, end }: { start: Date; end: Date | null }) => {
  if (!end) return <span className="text-muted-foreground">-</span>;

  const totalSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let text = `${seconds}s`;
  if (hours > 0) {
    text = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s`;
  }

  return (
    <div className="flex items-center text-sm text-slate-600 dark:text-[#B0B0B1]">
      <TimerIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-[#717171]" />
      {text}
    </div>
  );
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  const items = executions.data.items;

  if (items.length === 0) return <ExecutionsEmpty />;

  return (
    <div className="bg-white dark:bg-[#282828] rounded-xl border border-slate-200 dark:border-[#393939] shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-4 border-b border-slate-200 dark:border-[#393939] bg-slate-50/50 dark:bg-[#282828] px-6 py-3 text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] uppercase tracking-wider">
        <div className="col-span-4">Workflow</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Duration</div>
        <div className="col-span-3">Started</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-[#393939]">
        {items.map((execution) => (
          <ExecutionRow key={execution.id} data={execution} />
        ))}
      </div>
    </div>
  );
};

const ExecutionRow = ({
  data,
}: {
  data: Execution & { workflow: { id: string; name: string } };
}) => {
  return (
    <Link
      href={`/executions/${data.id}`}
      className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors group cursor-pointer"
    >
      <div className="col-span-4 flex flex-col justify-center">
        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-slate-400 transition-colors">
          {data.workflow.name}
        </span>
        <div className="flex items-center mt-1 text-xs text-slate-400 dark:text-[#6C6C6E] font-mono">
          <HashIcon className="w-3 h-3 mr-0.5" />
          {data.id.slice(0, 8)}...
        </div>
      </div>

      <div className="col-span-2 flex items-center">
        <StatusBadge status={data.status} />
      </div>

      <div className="col-span-2 flex items-center">
        <DurationDisplay start={data.startedAt} end={data.completedAt} />
      </div>

      <div className="col-span-3 flex flex-col justify-center">
        <div className="flex items-center text-sm text-slate-700 dark:text-[#B0B0B1]">
          <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-[#717171]" />
          {format(data.startedAt, "MMM d, yyyy")}
        </div>
        <span className="text-xs text-slate-400 pl-5 mt-0.5 dark:text-[#6C6C6E]">
          {format(data.startedAt, "h:mm a")} (
          {formatDistanceToNow(data.startedAt, { addSuffix: true })})
        </span>
      </div>

      <div className="col-span-1 flex justify-end">
        <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
    </Link>
  );
};

export const ExecutionsHeader = () => {
  return (
    <div className="mb-6">
      <EntityHeader
        title="Executions"
        description="Monitor the real-time status and history of your workflow runs."
      />
    </div>
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <div className="mt-4 border-t border-transparent pt-2">
      <EntityPagination
        disabled={executions.isFetching}
        totalPages={executions.data.totalPages}
        page={executions.data.page}
        onPageChange={(page) => {
          setParams({ ...params, page });
        }}
      />
    </div>
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-11 scale-105">
      {children}
      <ExecutionsPagination />
    </div>
  );
};

export const ExecutionsLoading = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-4">
      <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-md w-1/3 animate-pulse mb-8" />
      <div className="border border-slate-200 dark:border-[#393939] rounded-xl overflow-hidden bg-white dark:bg-[#282828]">
        <div className="bg-slate-50/50 dark:bg-[#282828] h-10 border-b border-slate-200 dark:border-[#393939]" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 border-b border-slate-100 dark:border-[#393939] p-4 flex items-center space-x-4"
          >
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/6 animate-pulse" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/6 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExecutionsError = () => {
  return (
    <div className="py-12">
      <ErrorView message="We ran into an issue loading your execution history." />
    </div>
  );
};

export const ExecutionsEmpty = () => {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-12">
      <EmptyView2 message="No executions found. Trigger a workflow to see it appear here." />
    </div>
  );
};
