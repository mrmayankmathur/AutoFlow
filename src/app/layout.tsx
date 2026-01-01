import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ModalProvider from "@/providers/modal-provider";
import { Provider } from "jotai";

import "./globals.css";

const font = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KriyaLabs: AI Workflow Automation Platform",
  description: "AI Workflow Automation Platform & Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <TRPCReactProvider>
          <NuqsAdapter>
            <ThemeProvider attribute="class">
              <ModalProvider>
                <Provider>
                  {children}
                  <Toaster className="z-100" />
                </Provider>
              </ModalProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
