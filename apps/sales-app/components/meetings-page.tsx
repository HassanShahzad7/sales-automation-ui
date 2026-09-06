"use client";

import { CalendarIcon } from "lucide-react";
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
import { DEMO_MEETINGS } from "@/lib/demo-meetings";
import { useWorkspace } from "@/lib/workspace-context";

const STATUS_LABEL = {
  scheduled: "Scheduled",
  completed: "Completed",
  canceled: "Canceled",
} as const;

export function MeetingsPage() {
  const { isDemo } = useWorkspace();

  if (!isDemo) {
    return <ComingSoonPage icon={CalendarIcon} title="Meetings" />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Meetings"
        description="Meetings booked with prospects."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prospect</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_MEETINGS.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.prospectName}</TableCell>
              <TableCell>{m.companyName}</TableCell>
              <TableCell className="text-muted-foreground">
                {m.meetingType}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(m.scheduledAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <StatusBadge status={STATUS_LABEL[m.status]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
