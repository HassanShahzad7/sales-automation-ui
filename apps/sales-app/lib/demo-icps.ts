import type { Icp } from "@/lib/api";

// Entirely fictional ICPs used to populate the Demo Workspace. IDs are
// namespaced with "demo-" so they can never collide with real database IDs.
export const DEMO_ICPS: Icp[] = [
  {
    id: "demo-icp-1",
    name: "Series B SaaS — VP Eng",
    description:
      "US-based SaaS companies, 50-500 employees, targeting VPs of Engineering.",
  },
  {
    id: "demo-icp-2",
    name: "Fintech Compliance Leads",
    description:
      "EU fintech companies, 200+ employees, targeting compliance and risk leaders.",
  },
  {
    id: "demo-icp-3",
    name: "Healthcare Ops Directors",
    description:
      "US healthcare operators, 100-1000 employees, targeting Directors of Operations.",
  },
];

// Mutated in place when "Create ICP" is used inside the Demo Workspace, so
// the new ICP shows up in the list without needing a real backend. Purely a
// client-side session convenience — nothing here is persisted.
export function addDemoIcp(icp: Icp): void {
  DEMO_ICPS.push(icp);
}
