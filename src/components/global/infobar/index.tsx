"use client";
import React, { useEffect } from "react";
import { Book, Headphones, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import UserButton from "../user-button";
import { useWorkflowsParams } from "@/features/workflows/hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

type Props = {};

const InfoBar = (props: Props) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <div className="flex flex-row justify-end gap-6 items-center px-8 py-4 w-full dark:bg-black/40 backdrop-blur-lg border-b border-neutral-800/50 z-10">
      <span className="flex items-center rounded-full bg-muted px-4 py-[0.5px]">
        <Search />
        <Input
          placeholder="Search Workflows"
          className="border-none bg-transparent rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </span>
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
