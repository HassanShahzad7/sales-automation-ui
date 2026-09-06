// Deterministic mapping from real backend outreach state (the Outreach.maturity
// enum, see sales-automation-agent app/models/apollo.py) to the labels shown
// in the Prospects table. No AI or guesswork involved — same input always
// produces the same output.
import type { OutreachSummary } from "@/lib/api";

export type ResearchStatus = "not-started" | "in-progress" | "completed";

const LINKEDIN_RESEARCHED_AT = new Set([
  "profile_researched",
  "message_sent",
  "in_conversation",
  "responded_yes",
  "responded_no",
  "meeting_booked",
  "deal_finalized",
  "deal_lost",
]);

const LINKEDIN_IN_PROGRESS_AT = new Set(["connection_sent", "connected"]);

export function deriveResearchStatus(
  linkedinOutreach: OutreachSummary | null,
): ResearchStatus {
  const maturity = linkedinOutreach?.maturity;
  if (!maturity || maturity === "not_contacted") return "not-started";
  if (LINKEDIN_RESEARCHED_AT.has(maturity)) return "completed";
  if (LINKEDIN_IN_PROGRESS_AT.has(maturity)) return "in-progress";
  return "not-started";
}

const MATURITY_RANK: Record<string, number> = {
  not_contacted: 0,
  connection_sent: 1,
  reached_out: 1,
  connected: 1,
  profile_researched: 2,
  message_sent: 2,
  in_conversation: 3,
  responded_yes: 4,
  responded_no: 4,
  meeting_booked: 5,
  deal_finalized: 6,
  deal_lost: 6,
};

const MATURITY_LABEL: Record<string, string> = {
  not_contacted: "Not Contacted",
  connection_sent: "Connection Sent",
  reached_out: "Sent",
  connected: "Connected",
  profile_researched: "Profile Researched",
  message_sent: "Message Sent",
  in_conversation: "In Conversation",
  responded_yes: "Replied",
  responded_no: "Not Interested",
  meeting_booked: "Meeting Booked",
  deal_finalized: "Deal Won",
  deal_lost: "Deal Lost",
};

function furthestChannel(
  emailOutreach: OutreachSummary | null,
  linkedinOutreach: OutreachSummary | null,
): OutreachSummary | null {
  const emailRank = emailOutreach
    ? (MATURITY_RANK[emailOutreach.maturity] ?? 0)
    : -1;
  const linkedinRank = linkedinOutreach
    ? (MATURITY_RANK[linkedinOutreach.maturity] ?? 0)
    : -1;
  if (emailRank === -1 && linkedinRank === -1) return null;
  return emailRank >= linkedinRank ? emailOutreach : linkedinOutreach;
}

export function deriveOutreachStatusLabel(
  emailOutreach: OutreachSummary | null,
  linkedinOutreach: OutreachSummary | null,
): string {
  const furthest = furthestChannel(emailOutreach, linkedinOutreach);
  if (!furthest) return "Not Contacted";
  return MATURITY_LABEL[furthest.maturity] ?? furthest.maturity;
}

export function deriveNextAction(
  researchStatus: ResearchStatus,
  emailOutreach: OutreachSummary | null,
  linkedinOutreach: OutreachSummary | null,
): string {
  const furthest = furthestChannel(emailOutreach, linkedinOutreach);
  const maturity = furthest?.maturity ?? "not_contacted";

  if (maturity === "meeting_booked") return "Prep for call";
  if (maturity === "responded_yes" || maturity === "responded_no")
    return "Review reply";
  if (maturity === "in_conversation") return "Continue conversation";
  if (maturity === "deal_finalized" || maturity === "deal_lost")
    return "Archive";
  if (
    ["reached_out", "connection_sent", "connected", "message_sent"].includes(
      maturity,
    )
  )
    return "Await reply";

  if (researchStatus === "not-started") return "Start research";
  if (researchStatus === "in-progress") return "Finish research";
  return "Generate outreach";
}

export function formatLastActivity(
  emailOutreach: OutreachSummary | null,
  linkedinOutreach: OutreachSummary | null,
  fallbackIso?: string | null,
): string {
  const dates = [
    emailOutreach?.last_contact_date,
    linkedinOutreach?.last_contact_date,
  ].filter((d): d is string => Boolean(d));
  const latest = dates.sort().at(-1) ?? fallbackIso;
  if (!latest) return "No activity yet";
  return new Date(latest).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
