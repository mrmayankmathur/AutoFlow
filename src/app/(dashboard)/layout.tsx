import SidebarShell from "@/components/global/sidebar/sidebar-shell";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  return <SidebarShell user={user}>{children}</SidebarShell>;
}
