import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import InfoBar from "@/components/global/infobar";
import SidebarShell from "@/components/global/sidebar/sidebar-shell";
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

  const user = session?.user;
  return (
    <SidebarShell user={user}>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <div className="w-full h-full flex flex-col">{children}</div>
    </SidebarShell>
  );
}
