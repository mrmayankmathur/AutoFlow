import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { SearchParams } from "nuqs/server";

import {
  WorkflowsContainer,
  WorkflowsError,
  WorkflowsHeader,
  WorkflowsLoading,
} from "@/features/workflows/components/workflows";
import { WorkflowsListClient } from "@/features/workflows/components/workflows-client";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await workflowsParamsLoader(searchParams);
  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <WorkflowsHeader />
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowsError />}>
          <Suspense fallback={<WorkflowsLoading />}>
            <WorkflowsListClient />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
