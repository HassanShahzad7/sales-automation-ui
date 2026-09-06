export type DemoMeeting = {
  id: string;
  prospectName: string;
  companyName: string;
  meetingType: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "canceled";
};

// Entirely fictional booked meetings for the Demo Workspace.
export const DEMO_MEETINGS: DemoMeeting[] = [
  {
    id: "demo-meeting-1",
    prospectName: "Priya Nair",
    companyName: "NimbusData",
    meetingType: "Intro Call",
    scheduledAt: "2026-09-04T15:00:00Z",
    status: "scheduled",
  },
  {
    id: "demo-meeting-2",
    prospectName: "Aisha Rahman",
    companyName: "Ledger Trust",
    meetingType: "Discovery Call",
    scheduledAt: "2026-09-06T13:00:00Z",
    status: "scheduled",
  },
  {
    id: "demo-meeting-3",
    prospectName: "Devon Marsh",
    companyName: "Kestrel Fintech",
    meetingType: "Product Demo",
    scheduledAt: "2026-08-20T16:00:00Z",
    status: "completed",
  },
];
