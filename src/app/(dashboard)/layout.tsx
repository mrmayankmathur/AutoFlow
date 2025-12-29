import SidebarShell from "@/components/global/sidebar/sidebar-shell";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { redirect } from "next/navigation";
import InfoBar from "@/components/global/infobar";

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

  const user = session?.user;
  return (
    <SidebarShell user={user}>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <div className="w-full sticky top-0 z-10">
        <InfoBar />
      </div>
      <div className="w-full overflow-y-clip">{children}</div>
    </SidebarShell>
  );
}
