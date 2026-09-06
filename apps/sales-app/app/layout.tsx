import type { Metadata } from "next";
import { AuthenticatedShell } from "@/components/authenticated-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Assistant",
  description: "AI-powered sales automation assistant",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-dvh">
      <body className="h-dvh font-sans">
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </body>
    </html>
  );
}
