"use client";
import React, { useEffect } from "react";
import { Book, Headphones, Search, LogOut, Settings } from "lucide-react";
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
// import { useBilling } from "@/providers/billing-provider";
// import { onPaymentDetails } from "@/app/(main)/(pages)/billing/_actions/payment-connecetions";
import { authClient } from "@/lib/auth-client"; // Import your client helper
import { useRouter } from "next/navigation";
import UserButton from "../user-button";

type Props = {};

const InfoBar = (props: Props) => {
  //   const { credits, tier, setCredits, setTier } = useBilling();
  const router = useRouter();

  // 1. Get the current session on the client side
  const { data: session } = authClient.useSession();

  const onGetPayment = async () => {
    // const response = await onPaymentDetails();
    // if (response) {
    //   setTier(response.tier!);
    //   setCredits(response.credits!);
    // }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in"); // Redirect to sign-in page
        },
      },
    });
  };

  useEffect(() => {
    onGetPayment();
  }, []);

  return (
    <div className="flex flex-row justify-end gap-6 items-center lg:px-24 md:px-16 px-8 py-4 w-full dark:bg-black/40 backdrop-blur-lg border-b border-neutral-800/50 z-10">
      <span className="flex items-center rounded-full bg-muted px-4 py-[0.5px]">
        <Search />
        <Input
          pattern="search"
          placeholder="Quick Search"
          className="border-none bg-transparent rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
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
