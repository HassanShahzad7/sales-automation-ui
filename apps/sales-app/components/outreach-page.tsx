"use client";

import { SendIcon } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_OUTREACH_MESSAGES } from "@/lib/demo-outreach";
import { useWorkspace } from "@/lib/workspace-context";

const STATUS_LABEL = {
  sent: "Sent",
  scheduled: "Scheduled",
  replied: "Replied",
  bounced: "Bounced",
} as const;

export function OutreachPage() {
  const { isDemo } = useWorkspace();

  if (!isDemo) {
    return <ComingSoonPage icon={SendIcon} title="Outreach" />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Outreach"
        description="Email and LinkedIn messages sent to prospects."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prospect</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_OUTREACH_MESSAGES.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.prospectName}</TableCell>
              <TableCell>{m.companyName}</TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {m.channel}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {m.subject}
              </TableCell>
              <TableCell>
                <StatusBadge status={STATUS_LABEL[m.status]} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(m.sentAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
