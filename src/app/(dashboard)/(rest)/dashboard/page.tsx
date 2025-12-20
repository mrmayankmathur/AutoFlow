"use client";

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { caller } from "@/trpc/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  //   await requireAuth();

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow created successfully");
      },
    })
  );

  return (
    <div className="min-h-screen min-w-screen items-center justify-center flex flex-col gap-2">
      <pre className="text-white">{JSON.stringify(data, null, 2)}</pre>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        {create.isPending ? "Creating..." : "Create Workflow"}
      </Button>
    </div>
  );
};

export default Page;
