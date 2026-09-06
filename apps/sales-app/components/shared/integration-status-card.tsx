import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

type IntegrationConnectionStatus =
  | "connected"
  | "not-connected"
  | "needs-attention";

const STATUS_LABEL: Record<IntegrationConnectionStatus, string> = {
  connected: "Connected",
  "not-connected": "Not Connected",
  "needs-attention": "Needs Attention",
};

export function IntegrationStatusCard({
  name,
  status,
  lastSync,
  icon: Icon,
}: {
  name: string;
  status: IntegrationConnectionStatus;
  lastSync: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex items-center gap-3 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <span className="truncate font-medium text-sm">{name}</span>
            <StatusBadge className="shrink-0" status={STATUS_LABEL[status]} />
          </div>
          <p className="mt-0.5 truncate text-muted-foreground text-xs">
            {lastSync}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
