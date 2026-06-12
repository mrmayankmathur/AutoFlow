"use client";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { createContext, useContext, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  // Removed setOpen triggers for desktop hover
  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-4 ml-2 hidden lg:flex lg:flex-col bg-neutral-100 dark:bg-neutral-800 shrink-0",
        // Fixed width for desktop (collapsed state)
        "w-[62px]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-10 sm:px-1 md:px-4 py-4 flex flex-row lg:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800",
      )}
      {...props}
    >
      <div className="sm:w-4 sm:h-4 flex justify-end z-20">
        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-50 flex flex-col justify-between",
              className,
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive = false,
  ...props
}: {
  link: Links;
  className?: string;
  isActive?: boolean;
}) => {
  // Common link content
  const LinkContent = (
    <a
      href={link.href}
      className={cn(
        "flex items-center gap-2 group/sidebar py-2 transition-all duration-150",
        // Desktop: Center items. Mobile: Left align.
        "lg:justify-center justify-start w-full lg:w-auto",
        isActive
          ? "light:text-black! font-bold rounded-lg hover:scale-105 dark:text-white! lg:bg-transparent! dark:hover:bg-neutral-700! light:hover:bg-neutral-200! light:sm:bg-amber-50! dark:sm:bg-neutral-700!"
          : "light:text-neutral-600/30 dark:text-neutral-600/60 light:hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rounded-lg hover:scale-105 transition-all duration-150",
        className,
      )}
      {...props}
    >
      {link.icon}

      {/* Text label: Hidden on Desktop (lg:hidden), Visible on Mobile */}
      <span className="text-neutral-700 dark:text-neutral-200 text-md whitespace-pre inline-block ml-2 lg:hidden">
        {link.label}
      </span>
    </a>
  );

  return (
    <>
      {/* Desktop View: Tooltip wrapped */}
      <div className="hidden lg:block">
        <Tooltip>
          <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-black text-white dark:bg-white dark:text-black border-none ml-2"
          >
            <p>{link.label}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile View: Raw link (text is visible via CSS above) */}
      <div className="lg:hidden block">{LinkContent}</div>
    </>
  );
};
