"use client";

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/global/sidebar";
import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ActionRail } from "@/components/global/sidebar/ActionRail";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/global/mode-toggle";
import { SidebarActionButton } from "@/components/global/sidebar/sidebar-action-button";
import { motion } from "framer-motion";
import UserButton from "../user-button";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  children: React.ReactNode;
};

const SidebarTooltip = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => {
  return (
    <>
      {/* Desktop: Tooltip */}
      <div className="hidden lg:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer">{children}</div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-black text-white dark:bg-white dark:text-black border-none ml-2"
          >
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {/* Mobile: Row with text */}
      <div className="flex lg:hidden items-center gap-2 cursor-pointer w-full">
        {children}
        <span className="text-neutral-800 dark:text-neutral-200">{label}</span>
      </div>
    </>
  );
};

export default function SidebarShell({ user, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  const links = [
    {
      label: "Workflows",
      href: "/workflows",
      icon: <FolderOpenIcon className="text-md shrink-0" />,
    },
    {
      label: "Credentials",
      href: "/credentials",
      icon: <KeyIcon className="text-md shrink-0" />,
    },
    {
      label: "Executions",
      href: "/executions",
      icon: <HistoryIcon className="text-md shrink-0" />,
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between">
          <div className="flex flex-col">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mt-1">
              <Image src="/logo.png" alt="Logo" width={25} height={25} />
              {open && (
                <span className="text-neutral-800 dark:text-neutral-200">
                  KriyaLabs
                </span>
              )}
            </Link>

            {/* Links */}
            <div className="mt-12 -ml-[5px] flex flex-col gap-6">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");

                return (
                  <SidebarLink
                    key={link.href}
                    link={link}
                    isActive={isActive}
                  />
                );
              })}
            </div>

            <Separator className="-ml-[4px] mt-6 dark:bg-neutral-700" />

            {/* Horizontal Action rail */}
            <motion.div
              transition={{
                duration: 0.15,
                ease: "easeInOut",
              }}
              className="w-[54px] flex justify-center ml-25 -mt-15 rotate-90 lg:rotate-0 lg:-ml-4 lg:mt-5.5"
            >
              <ActionRail />
            </motion.div>

            {/* Vertical Action rail */}
            {/* <motion.div
              animate={{
                opacity: open ? 0 : 1,
              }}
              transition={{
                duration: 0.15,
                ease: "easeInOut",
              }}
              className="w-[54px] flex justify-center -ml-4 -mt-35 rotate-0"
            >
              <ActionRail />
            </motion.div> */}
          </div>

          <div className="flex flex-col gap-4">
            {/* Upgrade to Pro */}
            <div className="flex items-center gap-2">
              <SidebarActionButton
                onClick={() => router.push("/settings")}
                className="-ml-[5px] flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 px-2"
              >
                <Settings className="h-4 w-4 shrink-0" />
              </SidebarActionButton>

              {open && (
                <span
                  className={cn(
                    "text-neutral-800 dark:text-neutral-200 transition-opacity duration-300 ease-in-out",
                    open ? "opacity-100" : "opacity-0"
                  )}
                >
                  Settings
                </span>
              )}
            </div>

            {/* Upgrade to Pro */}
            {!hasActiveSubscription && !isLoading && (
              <div className="flex items-center gap-2">
                <SidebarActionButton
                  onClick={() => authClient.checkout({ slug: "KriyaLabs-Pro" })}
                  className="-ml-[5px] flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 px-2"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                </SidebarActionButton>

                {open && (
                  <span
                    className={cn(
                      "text-neutral-800 dark:text-neutral-200 transition-opacity duration-300 ease-in-out",
                      open ? "opacity-100" : "opacity-0"
                    )}
                  >
                    Upgrade to Pro
                  </span>
                )}
              </div>
            )}

            {/* Billing Portal */}
            <div className="flex items-center gap-2">
              <SidebarActionButton
                onClick={() => authClient.customer.portal()}
                className="-ml-[5px] flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 px-2"
              >
                <CreditCardIcon className="h-4 w-4 shrink-0" />
              </SidebarActionButton>

              {open && (
                <span
                  className={cn(
                    "text-neutral-800 dark:text-neutral-200 transition-opacity duration-300 ease-in-out",
                    open ? "opacity-100" : "opacity-0"
                  )}
                >
                  Billing Portal
                </span>
              )}
            </div>

            {/* User Button */}
            <div className="-ml-[5px] flex items-center gap-2">
              <SidebarTooltip label={user?.name || "Profile"}>
                {user ? <UserButton user={user} /> : null}
              </SidebarTooltip>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex">
        <div
          className={cn(
            "h-full w-screen",
            "rounded-tl-2xl",
            "border border-neutral-200 dark:border-neutral-700/50",
            "bg-white dark:bg-neutral-900",
            "overflow-hidden"
          )}
        >
          <div className="h-full overflow-y-auto pt-0 px-0 sm:-px-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
