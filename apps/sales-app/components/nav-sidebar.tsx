"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChartIcon,
  Building2Icon,
  CableIcon,
  ChevronDownIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  CalendarIcon as MeetingsIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import { AutomationMenu } from "@/components/automation-menu";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSalesRuntime } from "@/lib/runtime-provider";

const PRIMARY_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/chat", label: "Chat", icon: MessageSquareIcon },
  { href: "/icps", label: "ICPs", icon: TargetIcon },
  { href: "/companies", label: "Companies", icon: Building2Icon },
  { href: "/prospects", label: "Prospects", icon: UsersIcon },
  { href: "/outreach", label: "Outreach", icon: SendIcon },
  { href: "/inbox", label: "Inbox", icon: InboxIcon },
  { href: "/meetings", label: "Meetings", icon: MeetingsIcon },
  { href: "/workflows", label: "Workflows", icon: WorkflowIcon },
  { href: "/integrations", label: "Integrations", icon: CableIcon },
  { href: "/analytics", label: "Analytics", icon: BarChartIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function NavSidebar() {
  const pathname = usePathname();
  const { logout } = useSalesRuntime();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <SparklesIcon className="size-5 shrink-0 text-primary" />
          <span className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Sales Assistant
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {PRIMARY_NAV.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/automation mt-auto">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                Automation
                <ChevronDownIcon className="ml-auto size-4 transition-transform group-data-[state=closed]/automation:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <AutomationMenu />
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <WorkspaceSwitcher />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOutIcon />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
