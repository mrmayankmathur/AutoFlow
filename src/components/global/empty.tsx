import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils"; // Assuming you have the standard utils

// --- 1. Container ---
interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dashed" | "glass";
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-background border-border",
      dashed:
        "bg-background/50 border-dashed border-2 border-muted-foreground/20",
      glass:
        "bg-white/40 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-sm",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border p-8 text-center animate-in fade-in-50 zoom-in-95 duration-300",
          variants[variant],
          className,
        )}
        {...props}
      >
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          {children}
        </div>
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";

// --- 2. Icon Wrapper (The Enhanced Part) ---
interface EmptyStateIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
}

const EmptyStateIcon = ({
  icon: Icon,
  className,
  ...props
}: EmptyStateIconProps) => {
  return (
    <div
      className={cn("flex items-center justify-center mb-6", className)}
      {...props}
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 border border-muted-foreground/10 shadow-inner">
        {/* Subtle decorative ring */}
        <div className="absolute -inset-2 rounded-3xl bg-muted/20 -z-10" />
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
    </div>
  );
};

// --- 3. Text Components ---
const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "mt-2 text-xl font-semibold tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
EmptyStateTitle.displayName = "EmptyStateTitle";

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm",
      className,
    )}
    {...props}
  />
));
EmptyStateDescription.displayName = "EmptyStateDescription";

// --- 4. Actions (Buttons) ---
const EmptyStateActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-8 flex flex-col sm:flex-row items-center gap-3",
      className,
    )}
    {...props}
  />
));
EmptyStateActions.displayName = "EmptyStateActions";

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
};
