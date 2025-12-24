"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

type Props = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

const UserButton = ({ user }: Props) => {
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
        onError: () => {
          console.error("Error signing out");
        },
      },
    });
  };

  const handleSettings = () => {
    router.push("/settings");
    router.refresh();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative group outline-none">
          <span className="absolute inset-0 rounded-full bg-linear-to-tr from-indigo-500/40 via-purple-500/30 to-pink-500/40 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <Avatar className="relative h-9 w-9 cursor-pointer border border-neutral-700 bg-black transition-all duration-300 group-hover:scale-105">
            <AvatarImage
              src={user.image || ""}
              alt={user.name || "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-neutral-900 text-xs font-semibold text-white">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={14}
        className="
          w-72 rounded-2xl
          border border-white/10
          bg-black/55
          backdrop-blur-2xl backdrop-saturate-200
          shadow-[0_25px_50px_-15px_rgba(0,0,0,0.85)]
          text-white z-200
          animate-in fade-in zoom-in-95
        "
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/5 to-transparent" />

        {/* Profile header */}
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-neutral-700">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-neutral-900 text-sm">
                {user.name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-neutral-400 truncate font-mono">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-3 bg-neutral-800/70" />

        {/* Logout */}
        <button
          onClick={handleSettings}
          className="
            mx-3.5 my-2 rounded-lg cursor-pointer flex items-center gap-4.5 py-1 pr-38 pl-1.5
            focus:bg-[#A4A4A4]/40 hover:bg-[#A4A4A4]/30
            transition-all duration-200
          "
        >
          <Settings className="h-4 w-4" />
          <span className="font-medium text-[15px]">Settings</span>
        </button>

        <DropdownMenuSeparator className="mx-3 bg-neutral-800/70" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="
            mx-3 my-2 rounded-lg cursor-pointer
            text-red-400 focus:text-red-300
            focus:bg-red-950/40 hover:bg-red-950/30
            transition-all duration-200
          "
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
