"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import Image from "next/image";

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
          <Image
            src="/system.png"
            alt="System"
            width={1000}
            height={100}
            className="rounded-lg"
          />
        </div>
      ),
    },
    {
      id: "light",
      label: "Light",
      icon: Sun,
      visual: (
        <div className="flex h-full w-full">
          <Image
            src="/light.png"
            alt="Light"
            width={1000}
            height={100}
            className="rounded-lg"
          />
        </div>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
      visual: (
        <div className="flex h-full w-full">
          <Image
            src="/dark.png"
            alt="Dark"
            width={1100}
            height={100}
            className="rounded-lg"
          />
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
                  "flex lg:h-36 lg:w-72 md:h-36 md:w-72 h-38 w-74 cursor-pointer items-center justify-center rounded-lg border-2 border-transparent overflow-hidden transition-all hover:ring-2 hover:ring-neutral-400 hover:ring-offset-2 dark:hover:ring-neutral-600 dark:hover:ring-offset-neutral-900",
                  isActive
                    ? "ring-2 ring-neutral-950 ring-offset-2 dark:ring-neutral-200 dark:ring-offset-neutral-900"
                    : "border-neutral-200 bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-800"
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
