export type DemoReply = {
  id: string;
  prospectName: string;
  companyName: string;
  snippet: string;
  sentiment: "interested" | "not-interested" | "question";
  receivedAt: string;
};

// Entirely fictional inbox replies for the Demo Workspace.
export const DEMO_REPLIES: DemoReply[] = [
  {
    id: "demo-reply-1",
    prospectName: "Priya Nair",
    companyName: "NimbusData",
    snippet: "Sounds interesting — let's grab time Thursday.",
    sentiment: "interested",
    receivedAt: "2026-08-27T09:00:00Z",
  },
  {
    id: "demo-reply-2",
    prospectName: "Jordan Lee",
    companyName: "Acme Corp",
    snippet: "Can you send over pricing details before we talk further?",
    sentiment: "question",
    receivedAt: "2026-09-01T11:00:00Z",
  },
  {
    id: "demo-reply-3",
    prospectName: "Aisha Rahman",
    companyName: "Ledger Trust",
    snippet: "This looks promising, happy to set up a call next week.",
    sentiment: "interested",
    receivedAt: "2026-09-02T09:30:00Z",
  },
  {
    id: "demo-reply-4",
    prospectName: "Sam Osei",
    companyName: "Kestrel Fintech",
    snippet: "Not a priority for us right now, but thanks for reaching out.",
    sentiment: "not-interested",
    receivedAt: "2026-08-25T09:30:00Z",
  },
];
