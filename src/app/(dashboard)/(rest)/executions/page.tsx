import {
  ExecutionsContainer,
  ExecutionsError,
  ExecutionsList,
  ExecutionsLoading,
} from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await executionsParamsLoader(searchParams);
  prefetchExecutions(params);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Executions
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#A1A1A1] max-w-2xl">
            View and monitor the real-time status, duration, and history of all
            workflow executions.
          </p>
        </div>

        <div className="h-px bg-slate-200 dark:bg-[#2F2F2F]" />

        <ExecutionsContainer>
          <HydrateClient>
            <ErrorBoundary
              fallback={
                <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30 p-6">
                  <ExecutionsError />
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="rounded-xl border border-slate-200 dark:border-[#393939] bg-white dark:bg-[#282828] p-4">
                    <ExecutionsLoading />
                  </div>
                }
              >
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <ExecutionsList />
                </div>
              </Suspense>
            </ErrorBoundary>
          </HydrateClient>
        </ExecutionsContainer>
      </div>
    </div>
  );
};

export default Page;
