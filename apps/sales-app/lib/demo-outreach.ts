export type DemoOutreachMessage = {
  id: string;
  prospectName: string;
  companyName: string;
  channel: "email" | "linkedin";
  subject: string;
  status: "sent" | "scheduled" | "replied" | "bounced";
  sentAt: string;
};

// Entirely fictional outreach messages for the Demo Workspace.
export const DEMO_OUTREACH_MESSAGES: DemoOutreachMessage[] = [
  {
    id: "demo-outreach-1",
    prospectName: "Priya Nair",
    companyName: "NimbusData",
    channel: "email",
    subject: "Quick question about scaling your platform team",
    status: "replied",
    sentAt: "2026-08-26T14:00:00Z",
  },
  {
    id: "demo-outreach-2",
    prospectName: "Priya Nair",
    companyName: "NimbusData",
    channel: "linkedin",
    subject: "Connection request + intro note",
    status: "replied",
    sentAt: "2026-08-25T10:00:00Z",
  },
  {
    id: "demo-outreach-3",
    prospectName: "Jordan Lee",
    companyName: "Acme Corp",
    channel: "email",
    subject: "Helping Acme Corp scale engineering headcount",
    status: "replied",
    sentAt: "2026-08-29T11:00:00Z",
  },
  {
    id: "demo-outreach-4",
    prospectName: "Sam Osei",
    companyName: "Kestrel Fintech",
    channel: "email",
    subject: "Streamlining compliance workflows at Kestrel",
    status: "replied",
    sentAt: "2026-08-25T09:00:00Z",
  },
  {
    id: "demo-outreach-5",
    prospectName: "Aisha Rahman",
    companyName: "Ledger Trust",
    channel: "email",
    subject: "A faster way to close your books",
    status: "replied",
    sentAt: "2026-09-02T09:00:00Z",
  },
  {
    id: "demo-outreach-6",
    prospectName: "Elena Petrov",
    companyName: "Bright Health Ops",
    channel: "email",
    subject: "Cutting ops overhead for healthcare teams",
    status: "sent",
    sentAt: "2026-09-03T09:00:00Z",
  },
  {
    id: "demo-outreach-7",
    prospectName: "Marcus Chen",
    companyName: "Vantage Cloud",
    channel: "email",
    subject: "Intro: helping Vantage Cloud's platform team move faster",
    status: "scheduled",
    sentAt: "2026-09-05T09:00:00Z",
  },
];
