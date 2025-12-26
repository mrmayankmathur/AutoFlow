import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// const sourceCodePro = Source_Code_Pro({
//   variable: "--font-source-code-pro",
//   subsets: ["latin"],
// });

// const roboto = Roboto({
//   variable: "--font-roboto",
//   subsets: ["latin"],
// });

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
          <ThemeProvider attribute="class">
            <NuqsAdapter>
              {children}
              <Toaster className="z-100" />
            </NuqsAdapter>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
