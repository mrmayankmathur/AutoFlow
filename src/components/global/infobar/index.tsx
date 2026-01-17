"use client";
import React, { useEffect, useState } from "react";
import { Book, Headphones, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import UserButton from "../user-button";
import { useWorkflowsParams } from "@/features/workflows/hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useCredentialsParams } from "@/features/credentials/hooks/use-credentials-params";

type Props = {};

const GlobalSearchInput = () => {
  const isCredentialsPage = usePathname()?.includes("/credentials");

  const [params, setParams] = isCredentialsPage
    ? useCredentialsParams()
    : useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <span className="flex items-center rounded-full bg-muted px-4 py-[0.5px]">
      <Search />
      <Input
        placeholder={
          isCredentialsPage ? "Search Credentials" : "Search Workflows"
        }
        className="border-none bg-transparent rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </span>
  );
};

const InfoBar = (props: Props) => {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  // State to track screen width
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    // Check on mount and resize
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const isCredentialsPage = pathname?.includes("/credentials");

  // RENDER LOGIC:
  // 1. If we are NOT on credentials page -> Always render
  // 2. If we ARE on credentials page -> Only render if screen is Large
  const shouldRenderSearch = !isCredentialsPage || isLargeScreen;

  return (
    <div className="flex flex-row justify-end gap-6 items-center px-8 py-4 w-full dark:bg-black/40 backdrop-blur-lg border-b border-neutral-800/50 z-10">
      {/* Conditionally render the entire component (and its hooks) */}
      {shouldRenderSearch && <GlobalSearchInput />}

      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Headphones />
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact Support</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Book />
          </TooltipTrigger>
          <TooltipContent>
            <p>Guide</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <UserButton user={session?.user} />
    </div>
  );
};

export default InfoBar;
