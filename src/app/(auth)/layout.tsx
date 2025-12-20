import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We add the 'light' class to force light mode styles on Shadcn components.
    // We add 'bg-white' and 'text-black' to override any global dark mode CSS variables.
    <div className="light">{children}</div>
  );
}
