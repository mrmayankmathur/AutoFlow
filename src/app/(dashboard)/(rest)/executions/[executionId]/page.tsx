import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ExecutionLoading,
  ExecutionView,
} from "@/features/executions/components/execution";
import { ExecutionsError } from "@/features/executions/components/executions";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface pageProps {
  params: Promise<{ executionId: string }>;
}

const Page = async ({ params }: pageProps) => {
  await requireAuth();

  const { executionId } = await params;
  prefetchExecution(executionId);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-slate-50/50 dark:from-[#171717] dark:via-[#070707] dark:to-[#171717]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-0 py-8 md:py-12 max-w-5xl">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
