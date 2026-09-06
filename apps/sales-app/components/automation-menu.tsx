"use client";

import { useState } from "react";
import {
  BuildingIcon,
  CalendarIcon,
  MailIcon,
  MessageSquareTextIcon,
  SparklesIcon,
  TargetIcon,
  UserPlusIcon,
  UserSearchIcon,
  UsersIcon,
} from "lucide-react";
import { CalendarActionDialog } from "@/components/calendar-action-dialog";
import { CreateIcpDialog } from "@/components/create-icp-dialog";
import { EnrichDialog, type EnrichMode } from "@/components/enrich-dialog";
import { GmailActionDialog } from "@/components/gmail-action-dialog";
import {
  LinkedInActionDialog,
  type LinkedInAction,
} from "@/components/linkedin-action-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Extracted from the old chat-ui.tsx SessionsSidebar: same 4 automation
// dropdowns + 5 dialogs, now rendered as sidebar menu items so they can live
// in the persistent AppShell instead of being coupled to the chat screen.
export function AutomationMenu() {
  const [enrichMode, setEnrichMode] = useState<EnrichMode | null>(null);
  const [createIcpOpen, setCreateIcpOpen] = useState(false);
  const [linkedInAction, setLinkedInAction] = useState<LinkedInAction | null>(
    null,
  );
  const [gmailOpen, setGmailOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <TargetIcon />
                <span>Apollo</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onSelect={() => setCreateIcpOpen(true)}>
                <TargetIcon className="size-4" />
                Create ICP
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEnrichMode("companies")}>
                <BuildingIcon className="size-4" />
                Enrich Companies
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEnrichMode("leads")}>
                <SparklesIcon className="size-4" />
                Enrich Leads
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <UsersIcon />
                <span>LinkedIn</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onSelect={() => setLinkedInAction("view_profile")}
              >
                <UserSearchIcon className="size-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLinkedInAction("connect")}>
                <UserPlusIcon className="size-4" />
                Send Connection Request
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setLinkedInAction("draft_message")}
              >
                <MessageSquareTextIcon className="size-4" />
                Draft Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <MailIcon />
                <span>Gmail</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onSelect={() => setGmailOpen(true)}>
                <MailIcon className="size-4" />
                Send Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <CalendarIcon />
                <span>Calendar</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onSelect={() => setCalendarOpen(true)}>
                <CalendarIcon className="size-4" />
                Schedule Meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateIcpDialog open={createIcpOpen} onOpenChange={setCreateIcpOpen} />

      {enrichMode && (
        <EnrichDialog
          mode={enrichMode}
          open={enrichMode !== null}
          onOpenChange={(open) => !open && setEnrichMode(null)}
        />
      )}

      {linkedInAction && (
        <LinkedInActionDialog
          action={linkedInAction}
          open={linkedInAction !== null}
          onOpenChange={(open) => !open && setLinkedInAction(null)}
        />
      )}

      <GmailActionDialog open={gmailOpen} onOpenChange={setGmailOpen} />

      <CalendarActionDialog
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
      />
    </>
  );
}
