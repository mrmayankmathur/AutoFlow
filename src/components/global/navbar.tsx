import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MenuIcon } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Adjust this import to where your server auth is defined
import UserButton from "./user-button"; // We will create this below

type Props = {};

const Navbar = async (props: Props) => {
  // 1. Fetch the session using headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return (
    <header className="max-w-screen fixed right-0 left-0 top-0 py-4 px-4 bg-black/40 backdrop-blur-lg z-100 flex items-center border-b border-neutral-900 justify-between">
      <div className="flex items-center gap-0">
        <Image src="/textLogo.png" width={75} height={75} alt="fuzzie logo" />
      </div>
      <nav className="absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%] hidden md:block">
        <ul className="flex items-center gap-y-4 gap-x-8 list-none dark:text-white">
          <li>
            <Link href="#">Pricing</Link>
          </li>
          <li>
            <Link href="#">Clients</Link>
          </li>
          <li>
            <Link href="#">Resources</Link>
          </li>
          <li>
            <Link href="#">Documentation</Link>
          </li>
          <li>
            <Link href="#">Enterprise</Link>
          </li>
        </ul>
      </nav>
      <aside className="flex items-center gap-4">
        <Link
          href={user ? "/workflows" : "/login"}
          className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
            {/* 2. Check if user exists */}
            {user ? "Dashboard" : "Get Started"}
          </span>
        </Link>

        {/* 3. Render Custom UserButton if logged in */}
        {user ? <UserButton user={user} /> : null}

        <MenuIcon className="md:hidden" />
      </aside>
    </header>
  );
};

export default Navbar;
