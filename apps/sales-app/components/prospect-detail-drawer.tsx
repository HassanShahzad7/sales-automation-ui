"use client";

import { useAui } from "@assistant-ui/react";
import {
  CalendarIcon,
  ExternalLinkIcon,
  MailIcon,
  UsersIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  deriveResearchStatus,
  formatLastActivity,
} from "@/lib/prospect-status";
import { useProspectDetail } from "@/lib/use-workspace-data";

const RESEARCH_STATUS_LABEL = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed",
} as const;

export function ProspectDetailDrawer({
  prospectId,
  onOpenChange,
}: {
  prospectId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const aui = useAui();
  const { detail, isLoading } = useProspectDetail(prospectId);

  const researchStatus = detail
    ? deriveResearchStatus(detail.linkedin_outreach)
    : "not-started";

  const runAction = (message: string) => {
    aui.thread().append(message);
  };

  return (
    <Sheet open={prospectId != null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{detail?.name ?? "Prospect"}</SheetTitle>
          <SheetDescription>
            Profile, research, and outreach status for this prospect.
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <p className="px-4 text-muted-foreground text-sm">Loading…</p>
        )}

        {!isLoading && detail && (
          <div className="flex flex-col gap-6 px-4 pb-6">
            <section className="flex flex-col gap-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Profile
              </h3>
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium text-foreground">
                  {detail.title ?? "Title N/A"}
                </p>
                <p className="text-muted-foreground">
                  {detail.company_name ?? "Company N/A"}
                </p>
                <p className="text-muted-foreground">
                  {detail.email ?? "No email on file"}
                </p>
                {detail.linkedin_url ? (
                  <a
                    href={
                      detail.linkedin_url.startsWith("http")
                        ? detail.linkedin_url
                        : `https://${detail.linkedin_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1 text-primary hover:underline"
                  >
                    LinkedIn Profile
                    <ExternalLinkIcon className="size-3" />
                  </a>
                ) : (
                  <p className="text-muted-foreground">No LinkedIn on file</p>
                )}
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Research
              </h3>
              <StatusBadge status={RESEARCH_STATUS_LABEL[researchStatus]} />
              {researchStatus === "completed" ? (
                <p className="text-muted-foreground text-sm">
                  LinkedIn profile research has been completed for this prospect
                  (maturity: {detail.linkedin_outreach?.maturity ?? "n/a"}).
                  Full research notes live in the outreach interaction log
                  below.
                </p>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    Research not completed.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      runAction(
                        `Research ${detail.name ?? "this prospect"}'s LinkedIn profile and summarize what you find. Prospect ID: ${detail.id}.`,
                      )
                    }
                  >
                    Start research
                  </Button>
                </>
              )}
            </section>

            <Separator />

            <section className="flex flex-col gap-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Outreach
              </h3>
              <p className="text-muted-foreground text-sm">
                Email: {detail.email_outreach?.maturity ?? "not contacted"} ·
                Last activity:{" "}
                {formatLastActivity(
                  detail.email_outreach,
                  detail.linkedin_outreach,
                )}
              </p>
              {(detail.email_outreach?.interactions.length ?? 0) > 0 && (
                <div className="flex flex-col gap-1 rounded-md border p-2 text-xs">
                  {detail.email_outreach?.interactions.map((i) => (
                    <p key={i.timestamp}>
                      <span className="font-medium">
                        {i.direction === "outbound" ? "Sent: " : "Received: "}
                      </span>
                      {i.content}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    runAction(
                      `Draft an outreach email to ${detail.name ?? "this prospect"} (${detail.email ?? "no email on file"}). Prospect ID: ${detail.id}.`,
                    )
                  }
                >
                  <MailIcon className="size-3.5" />
                  Draft email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    runAction(
                      `Send a LinkedIn connection request to ${detail.name ?? "this prospect"}. Prospect ID: ${detail.id}.`,
                    )
                  }
                >
                  <UsersIcon className="size-3.5" />
                  Send connection request
                </Button>
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Meeting
              </h3>
              {detail.email_outreach?.maturity === "meeting_booked" ||
              detail.linkedin_outreach?.maturity === "meeting_booked" ? (
                <StatusBadge status="Meeting Booked" tone="success" />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() =>
                    runAction(
                      `Schedule a meeting with ${detail.name ?? "this prospect"} (${detail.email ?? "no email on file"}). Prospect ID: ${detail.id}.`,
                    )
                  }
                >
                  <CalendarIcon className="size-3.5" />
                  Schedule meeting
                </Button>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
