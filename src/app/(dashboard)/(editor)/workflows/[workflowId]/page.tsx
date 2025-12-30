import {
  Editor,
  EditorError,
  EditorLoading,
} from "@/features/editor/components/editor";
import EditorHeader from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface pageProps {
  params: Promise<{ workflowId: string }>;
}

const Page = async ({ params }: pageProps) => {
  await requireAuth();
  const { workflowId } = await params;
  prefetchWorkflow(workflowId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <div className="w-full sticky top-0 z-10">
            <EditorHeader workflowId={workflowId} />
          </div>
          <main className="flex-1">
            <Editor workflowId={workflowId} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
