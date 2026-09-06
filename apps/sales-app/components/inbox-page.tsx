"use client";

import { InboxIcon } from "lucide-react";
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
import { DEMO_REPLIES } from "@/lib/demo-replies";
import { useWorkspace } from "@/lib/workspace-context";

const SENTIMENT_LABEL = {
  interested: "Interested",
  "not-interested": "Not Interested",
  question: "Question",
} as const;

const SENTIMENT_TONE = {
  interested: "success",
  "not-interested": "error",
  question: "pending",
} as const;

export function InboxPage() {
  const { isDemo } = useWorkspace();

  if (!isDemo) {
    return <ComingSoonPage icon={InboxIcon} title="Inbox" />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Inbox"
        description="Replies from prospects, flagged for review."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prospect</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_REPLIES.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.prospectName}</TableCell>
              <TableCell>{r.companyName}</TableCell>
              <TableCell className="text-muted-foreground">
                {r.snippet}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={SENTIMENT_LABEL[r.sentiment]}
                  tone={SENTIMENT_TONE[r.sentiment]}
                />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(r.receivedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
