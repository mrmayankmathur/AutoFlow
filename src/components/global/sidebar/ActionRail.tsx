"use client";

import clsx from "clsx";
import { Database, GitBranch, LucideMousePointerClick } from "lucide-react";

const items = [
  { icon: LucideMousePointerClick, active: true },
  { icon: GitBranch },
  { icon: Database },
  { icon: GitBranch },
];

export const ActionRail = () => {
  return (
    <div
      className={clsx(
        "flex items-center flex-col gap-9",
        "dark:bg-[#353346]/30 bg-neutral-200/50",
        "py-4 px-2 rounded-full",
        "h-56 overflow-y-auto",
        "border border-neutral-300 dark:border-neutral-700",
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <div
            key={index}
            className="relative dark:bg-[#353346]/70 bg-white p-2 rounded-full border border-neutral-300 dark:border-neutral-700 dark:border-t-2 dark:border-t-[#353346]"
          >
            <Icon
              size={18}
              className={clsx(
                item.active
                  ? "dark:text-white text-black"
                  : "text-muted-foreground",
              )}
            />

            {!isLast && (
              <div className="absolute left-1/2 -bottom-[30px] h-6 -translate-x-1/2 border-l-2 border-muted-foreground/50" />
            )}
          </div>
        );
      })}
    </div>
  );
};
