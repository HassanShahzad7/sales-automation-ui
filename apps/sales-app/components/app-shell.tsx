"use client";

import type { ReactNode } from "react";
import { NavSidebar } from "@/components/nav-sidebar";
import {
  SearchCompaniesToolUI,
  SearchPeopleToolUI,
} from "@/components/tool-ui/apollo-tool-ui";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Tool UI registrations are invisible; mounted once here so every
          route (dashboard's quick actions, /chat, etc.) can trigger Apollo
          tool calls and have them render, regardless of which page is active. */}
      <SearchCompaniesToolUI />
      <SearchPeopleToolUI />

      <NavSidebar />

      <SidebarInset className="min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center border-b px-3">
            <SidebarTrigger />
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
