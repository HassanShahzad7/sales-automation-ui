"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getAuth } from "@/lib/auth";
import { RuntimeProvider } from "@/lib/runtime-provider";
import { WorkspaceProvider } from "@/lib/workspace-context";

// Mounted once from app/layout.tsx so every route shares one AppShell
// instance instead of each page building its own header/sidebar (the old
// inconsistency between "/" and "/workflows"). Individual pages still run
// their own getAuth()-then-redirect guard (see app/page.tsx,
// app/workflows/page.tsx, etc.) for the actual redirect-to-/login UX; this
// wrapper only decides whether the persistent shell should render around
// whatever the page renders.
export function AuthenticatedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Re-check on every navigation (not just mount) so logging in and
    // landing on "/" immediately picks up the freshly saved auth state.
    if (pathname === "/login") {
      setIsAuthed(false);
      return;
    }
    setIsAuthed(!!getAuth()?.userToken);
  }, [pathname]);

  if (pathname === "/login" || !isAuthed) {
    return <>{children}</>;
  }

  return (
    <WorkspaceProvider>
      <RuntimeProvider>
        <AppShell>{children}</AppShell>
      </RuntimeProvider>
    </WorkspaceProvider>
  );
}
