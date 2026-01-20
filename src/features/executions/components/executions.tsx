"use client";

import { formatDistanceToNow } from "date-fns";
import {
  EmptyView2,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import type { Execution } from "@prisma/client";
import { ExecutionStatus } from "@prisma/client";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  return (
    <div className="lg:ml-10">
      <EntityList
        items={executions.data.items}
        getKey={(execution) => execution.id}
        renderItem={(execution) => <ExecutionItem data={execution} />}
        emptyView={<ExecutionsEmpty />}
      />
    </div>
  );
};

export const ExecutionsHeader = () => {
  return (
    <div className="lg:ml-10">
      <EntityHeader
        title="Executions"
        description="View your workflow executions history"
      />
    </div>
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => {
        setParams({ ...params, page });
      }}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView2 message="You haven't executed any workflows yet. Get started by running your first workflow." />
  );
};

const GetStatusIcon = ({ status }: { status: ExecutionStatus }) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="animate-spin size-5 text-blue-600" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const FormatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionItem = ({
  data,
}: {
  data: Execution & { workflow: { id: string; name: string } };
}) => {
  const duration = data.completedAt
    ? Math.round((data.completedAt.getTime() - data.startedAt.getTime()) / 1000)
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}
      {duration !== null && <>&bull; Took {duration} seconds</>}
    </>
  );

  return (
    <EntityItem
      key={data.id}
      href={`/executions/${data.id}`}
      title={FormatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          <GetStatusIcon status={data.status} />
        </div>
      }
    />
  );
};
