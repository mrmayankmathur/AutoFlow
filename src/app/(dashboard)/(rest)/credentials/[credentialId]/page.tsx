import { CredentialView } from "@/features/credentials/components/credential";
import {
  CredentialsError,
  LoadingAnimate,
} from "@/features/credentials/components/credentials";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface pageProps {
  params: Promise<{ credentialId: string }>;
}

const Page = async ({ params }: pageProps) => {
  await requireAuth();

  const { credentialId } = await params;
  prefetchCredential(credentialId);

  return (
    <div className="min-h-[calc(100vh-72px)] w-full bg-linear-to-br from-background to-muted/40">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialsError />}>
            <Suspense fallback={<LoadingAnimate />}>
              <h1 className="text-3xl font-semibold tracking-tight">
                Credentials
              </h1>
              <p className="text-muted-foreground">
                Securely store and manage your API keys for different providers.
              </p>
              <CredentialView credentialId={credentialId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
