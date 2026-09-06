// Demo-only data for the Dashboard (Outbound Command Center). These sections
// have no backend source yet (no campaigns table, no activity log, no
// integration health checks) and are rendered with an explicit "Demo Data"
// badge — see components/shared/demo-badge.tsx — so they are never mistaken
// for real database activity. Metrics that DO have a real source (ICP count,
// companies, prospects, outreach state) are computed directly in
// dashboard-page.tsx from getIcps/getCompanies/getProspects instead of here.

export type MetricDelta = {
  value: string;
  direction: "up" | "down" | "flat";
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta?: MetricDelta;
};

// "Drafts Awaiting Review" has no backend concept of a draft yet (outreach
// is logged only once actually sent), so it stays demo-only.
export const mockMetrics: DashboardMetric[] = [
  {
    label: "Drafts Awaiting Review",
    value: "18",
    delta: { value: "5 stale", direction: "flat" },
  },
];

export type PipelineStageState =
  | "not-started"
  | "in-progress"
  | "ready"
  | "needs-review"
  | "completed";

export type PipelineStage = {
  key: string;
  label: string;
  state: PipelineStageState;
};

export const mockPipelineStages: PipelineStage[] = [
  { key: "define-icp", label: "Define ICP", state: "completed" },
  { key: "find-companies", label: "Find Companies", state: "completed" },
  {
    key: "find-decision-makers",
    label: "Find Decision Makers",
    state: "completed",
  },
  {
    key: "research-prospects",
    label: "Research Prospects",
    state: "in-progress",
  },
  {
    key: "generate-outreach",
    label: "Generate Outreach",
    state: "needs-review",
  },
  { key: "send-follow-up", label: "Send / Follow Up", state: "ready" },
  { key: "handle-replies", label: "Handle Replies", state: "needs-review" },
  { key: "book-meeting", label: "Book Meeting", state: "not-started" },
];

export type CampaignStatus =
  | "success"
  | "pending"
  | "error"
  | "in-progress"
  | "default";

export type Campaign = {
  id: string;
  name: string;
  targetMarket: string;
  companies: number;
  prospects: number;
  outreachStatus: CampaignStatus;
  outreachLabel: string;
  replies: number;
  meetings: number;
  state: CampaignStatus;
  stateLabel: string;
};

export const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Series B SaaS — VP Eng",
    targetMarket: "US, 50-500 employees",
    companies: 128,
    prospects: 340,
    outreachStatus: "in-progress",
    outreachLabel: "Sending",
    replies: 14,
    meetings: 4,
    state: "in-progress",
    stateLabel: "Active",
  },
  {
    id: "camp-2",
    name: "Fintech Compliance Leads",
    targetMarket: "EU, 200+ employees",
    companies: 96,
    prospects: 210,
    outreachStatus: "pending",
    outreachLabel: "Drafts pending",
    replies: 3,
    meetings: 1,
    state: "pending",
    stateLabel: "Review needed",
  },
  {
    id: "camp-3",
    name: "Healthcare Ops Directors",
    targetMarket: "US, 100-1000 employees",
    companies: 74,
    prospects: 158,
    outreachStatus: "success",
    outreachLabel: "Completed",
    replies: 22,
    meetings: 7,
    state: "success",
    stateLabel: "Completed",
  },
];

export type ActivityItem = {
  id: string;
  icon: "search" | "mail" | "reply" | "calendar" | "linkedin" | "icp";
  text: string;
  timestamp: string;
};

export const mockActivity: ActivityItem[] = [
  {
    id: "act-1",
    icon: "reply",
    text: "New reply from Jordan Lee (Acme Corp) — flagged for review",
    timestamp: "10 minutes ago",
  },
  {
    id: "act-2",
    icon: "mail",
    text: 'Sent 24 outreach emails for "Series B SaaS — VP Eng"',
    timestamp: "42 minutes ago",
  },
  {
    id: "act-3",
    icon: "calendar",
    text: "Meeting booked with Priya Nair (NimbusData)",
    timestamp: "1 hour ago",
  },
  {
    id: "act-4",
    icon: "search",
    text: 'Found 18 new companies matching "Fintech Compliance Leads"',
    timestamp: "3 hours ago",
  },
  {
    id: "act-5",
    icon: "linkedin",
    text: "Sent 6 LinkedIn connection requests",
    timestamp: "5 hours ago",
  },
  {
    id: "act-6",
    icon: "icp",
    text: 'Created ICP "Healthcare Ops Directors"',
    timestamp: "Yesterday",
  },
];

export type IntegrationName =
  | "Apollo"
  | "LinkedIn"
  | "Gmail"
  | "Google Calendar";

export type IntegrationStatus =
  | "connected"
  | "not-connected"
  | "needs-attention";

export type IntegrationMock = {
  name: IntegrationName;
  status: IntegrationStatus;
  lastSync: string;
};

// Illustrative only — there is no real integration health-check endpoint yet.
export const mockIntegrations: IntegrationMock[] = [
  { name: "Apollo", status: "connected", lastSync: "Synced 5 minutes ago" },
  { name: "LinkedIn", status: "connected", lastSync: "Synced 20 minutes ago" },
  { name: "Gmail", status: "connected", lastSync: "Synced 2 minutes ago" },
  {
    name: "Google Calendar",
    status: "connected",
    lastSync: "Synced 10 minutes ago",
  },
];
