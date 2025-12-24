"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    {
      id: "system",
      label: "System default",
      icon: Monitor,
      visual: (
        <div className="flex h-full w-full">
          <div className="w-1/2 bg-[#F3F4F6] p-2">
            <div className="h-2 w-8 rounded-lg bg-white" />
            <div className="mt-2 space-y-1">
              <div className="h-1 w-12 rounded-lg bg-white" />
              <div className="h-1 w-10 rounded-lg bg-white" />
            </div>
          </div>
          <div className="w-1/2 bg-[#1F2937] p-2">
            <div className="h-2 w-8 rounded-lg bg-[#374151]" />
            <div className="mt-2 space-y-1">
              <div className="h-1 w-12 rounded-lg bg-[#374151]" />
              <div className="h-1 w-10 rounded-lg bg-[#374151]" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "light",
      label: "Light",
      icon: Sun,
      visual: (
        <div className="flex h-full w-full bg-[#F3F4F6] p-3">
          <div className="w-full">
            <div className="mx-auto h-2 w-8 rounded-lg bg-white" />
            <div className="mt-3 space-y-1">
              <div className="mx-auto h-1 w-12 rounded-lg bg-white" />
              <div className="mx-auto h-1 w-10 rounded-lg bg-white" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
      visual: (
        <div className="flex h-full w-full bg-[#1F2937] p-3">
          <div className="w-full">
            <div className="mx-auto h-2 w-8 rounded-lg bg-[#374151]" />
            <div className="mt-3 space-y-1">
              <div className="mx-auto h-1 w-12 rounded-lg bg-[#374151]" />
              <div className="mx-auto h-1 w-10 rounded-lg bg-[#374151]" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid max-w-2xl grid-rows-3 lg:grid-cols-3 lg:gap-64 gap-6">
        {themes.map((item) => {
          const isActive = theme === item.id;
          return (
            <div key={item.id}>
              <button
                onClick={() => setTheme(item.id)}
                className={cn(
                  "flex lg:h-36 lg:w-72 md:h-64 md:w-lg h-42 w-84 cursor-pointer items-center justify-center rounded-lg border-2 border-transparent overflow-hidden transition-all hover:ring-2 hover:ring-neutral-400 hover:ring-offset-2 dark:hover:ring-neutral-600 dark:hover:ring-offset-neutral-900",
                  isActive
                    ? "ring-2 ring-neutral-950 ring-offset-2 dark:ring-neutral-200 dark:ring-offset-neutral-900"
                    : "border-neutral-200 dark:border-neutral-800"
                )}
              >
                {item.visual}
              </button>
              <div className="mt-2 flex items-center gap-2">
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? "text-neutral-950 dark:text-neutral-200"
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "text-neutral-950 dark:text-neutral-200"
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
