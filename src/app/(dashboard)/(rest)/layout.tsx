import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import InfoBar from "@/components/global/infobar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // const _user = session?.user; // reserved if needed
  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <div className="w-full sticky top-0 z-10">
        <InfoBar />
      </div>
      <div className="w-full overflow-y-clip">{children}</div>
    </>
  );
}
