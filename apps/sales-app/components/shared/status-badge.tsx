import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "pending"
  | "error"
  | "in-progress"
  | "default";

const TONE_CLASSES: Record<StatusTone, string> = {
  success:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  pending:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  error:
    "border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  "in-progress":
    "border-transparent bg-primary/10 text-primary dark:bg-primary/20",
  default: "border-transparent bg-muted text-muted-foreground",
};

// Maps freeform status strings (prospect, company, campaign, integration...)
// to a semantic tone so every status pill in the app uses the same 4 colors.
const STATUS_TONE_MAP: Record<string, StatusTone> = {
  success: "success",
  completed: "success",
  connected: "success",
  sent: "success",
  qualified: "success",
  "meeting booked": "success",
  ready: "success",
  "ready for outreach": "success",

  pending: "pending",
  "needs-review": "pending",
  "needs attention": "pending",
  "needs-attention": "pending",
  "awaiting reply": "pending",
  "draft ready": "pending",
  review: "pending",
  "review needed": "pending",

  error: "error",
  failed: "error",
  "not interested": "error",

  "in-progress": "in-progress",
  "in progress": "in-progress",
  active: "in-progress",
  sending: "in-progress",
  researching: "in-progress",
  replied: "in-progress",

  default: "default",
  "not-started": "default",
  "not started": "default",
  "not-connected": "default",
  "not connected": "default",
  new: "default",
};

function resolveTone(status: string, tone?: StatusTone): StatusTone {
  if (tone) return tone;
  return STATUS_TONE_MAP[status.toLowerCase()] ?? "default";
}

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: StatusTone;
  className?: string;
}) {
  const resolved = resolveTone(status, tone);
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[resolved], className)}>
      {status}
    </Badge>
  );
}
