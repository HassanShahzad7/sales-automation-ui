"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAui } from "@assistant-ui/react";
import {
  BuildingIcon,
  CalendarIcon,
  CableIcon,
  InboxIcon,
  MailIcon,
  SearchIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";
import { CreateIcpDialog } from "@/components/create-icp-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationStatusCard } from "@/components/shared/integration-status-card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowStepper } from "@/components/shared/workflow-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Prospect } from "@/lib/api";
import {
  mockActivity,
  mockCampaigns,
  mockIntegrations,
  mockMetrics,
  mockPipelineStages,
} from "@/lib/demo-dashboard";
import { useCompanies, useIcps, useProspects } from "@/lib/use-workspace-data";
import { useWorkspace } from "@/lib/workspace-context";

function hasMaturity(prospect: Prospect, maturities: string[]): boolean {
  return (
    (prospect.email_outreach &&
      maturities.includes(prospect.email_outreach.maturity)) ||
    (prospect.linkedin_outreach &&
      maturities.includes(prospect.linkedin_outreach.maturity)) ||
    false
  );
}

const ACTIVITY_ICON = {
  search: SearchIcon,
  mail: MailIcon,
  reply: InboxIcon,
  calendar: CalendarIcon,
  linkedin: UsersIcon,
  icp: TargetIcon,
};

const INTEGRATION_ICON = {
  Apollo: TargetIcon,
  LinkedIn: UsersIcon,
  Gmail: MailIcon,
  "Google Calendar": CalendarIcon,
};

export function DashboardPage() {
  const router = useRouter();
  const aui = useAui();
  const { isDemo } = useWorkspace();

  const [createIcpOpen, setCreateIcpOpen] = useState(false);
  const { icps } = useIcps();
  const { companies } = useCompanies();
  const { prospects } = useProspects();

  const readyForOutreachCount = prospects.filter(
    (p) => p.email && !p.email_outreach,
  ).length;
  const meetingsBookedCount = prospects.filter((p) =>
    hasMaturity(p, ["meeting_booked"]),
  ).length;
  const repliesCount = prospects.filter((p) =>
    hasMaturity(p, ["responded_yes", "responded_no", "in_conversation"]),
  ).length;

  const realMetrics = [
    { label: "Companies Found", value: companies.length },
    { label: "Prospects Enriched", value: prospects.length },
    { label: "Ready for Outreach", value: readyForOutreachCount },
    { label: "Replies Requiring Attention", value: repliesCount },
    { label: "Meetings Booked", value: meetingsBookedCount },
  ];

  const handleFindCompanies = () => {
    aui
      .thread()
      .append(
        "Find new companies matching my ICP filters. Ask me which ICP if I have more than one.",
      );
  };

  const handleFindDecisionMakers = () => {
    aui
      .thread()
      .append(
        "Find decision-maker prospects at the companies we've already saved. Ask me which ICP if I have more than one.",
      );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Outbound Command Center"
        description="A live view of your outbound pipeline, from ICP to booked meeting."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard
          label="Active ICPs"
          value={icps != null ? String(icps.length) : "—"}
        />
        {realMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={String(metric.value)}
          />
        ))}
        {isDemo &&
          mockMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              {...(metric.delta ? { delta: metric.delta } : {})}
            />
          ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <CardTitle>Outbound Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {isDemo ? (
            <WorkflowStepper steps={mockPipelineStages} />
          ) : (
            <EmptyState
              icon={TargetIcon}
              title="No pipeline activity yet"
              description="Pipeline stages will appear here once you start finding companies and prospects."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => setCreateIcpOpen(true)}>
            <TargetIcon className="size-4" />
            Create ICP
          </Button>
          <Button variant="outline" onClick={handleFindCompanies}>
            <BuildingIcon className="size-4" />
            Find Companies
          </Button>
          <Button variant="outline" onClick={handleFindDecisionMakers}>
            <UsersIcon className="size-4" />
            Find Decision Makers
          </Button>
          <Button variant="outline" onClick={() => router.push("/prospects")}>
            <SearchIcon className="size-4" />
            Research Prospects
          </Button>
          <Button variant="outline" onClick={() => router.push("/outreach")}>
            <MailIcon className="size-4" />
            Generate Outreach
          </Button>
          <Button variant="outline" onClick={() => router.push("/inbox")}>
            <InboxIcon className="size-4" />
            Review Replies
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isDemo ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Target Market</TableHead>
                  <TableHead>Companies</TableHead>
                  <TableHead>Prospects</TableHead>
                  <TableHead>Outreach</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead>Meetings</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCampaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.targetMarket}
                    </TableCell>
                    <TableCell>{c.companies}</TableCell>
                    <TableCell>{c.prospects}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={c.outreachLabel}
                        tone={c.outreachStatus}
                      />
                    </TableCell>
                    <TableCell>{c.replies}</TableCell>
                    <TableCell>{c.meetings}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.stateLabel} tone={c.state} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={TargetIcon}
              title="No campaigns yet"
              description="Campaign tracking isn't available yet for real workspace data."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isDemo ? (
              mockActivity.map((item) => {
                const Icon = ACTIVITY_ICON[item.icon];
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm">{item.text}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={SearchIcon}
                title="No activity yet"
                description="An activity log isn't available yet for real workspace data."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isDemo ? (
              mockIntegrations.map((integration) => (
                <IntegrationStatusCard
                  key={integration.name}
                  name={integration.name}
                  status={integration.status}
                  lastSync={integration.lastSync}
                  icon={INTEGRATION_ICON[integration.name]}
                />
              ))
            ) : (
              <EmptyState
                icon={CableIcon}
                title="Integration status unavailable"
                description="Health checks for connected integrations aren't available yet for real workspace data."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <CreateIcpDialog open={createIcpOpen} onOpenChange={setCreateIcpOpen} />
    </div>
  );
}
