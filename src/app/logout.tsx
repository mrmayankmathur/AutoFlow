"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export const LogoutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/login");
            },
            onError: () => {
              setIsPending(false);
            },
          },
        });
      }}
    >
      {isPending ? (
        <>
          <Spinner /> <p>Signing out...</p>
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
};
