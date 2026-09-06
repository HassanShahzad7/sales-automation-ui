"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  UsersIcon,
} from "lucide-react";
import { ProspectDetailDrawer } from "@/components/prospect-detail-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deriveNextAction,
  deriveOutreachStatusLabel,
  deriveResearchStatus,
  formatLastActivity,
  type ResearchStatus,
} from "@/lib/prospect-status";
import { useProspects } from "@/lib/use-workspace-data";

const RESEARCH_STATUS_LABEL: Record<ResearchStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed",
};

const PAGE_SIZE = 50;

export function ProspectsPage() {
  const { prospects, isLoading, error } = useProspects();

  const [researchFilter, setResearchFilter] = useState("all");
  const [outreachFilter, setOutreachFilter] = useState("all");
  const [icpFilter, setIcpFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(
    null,
  );

  const rows = useMemo(
    () =>
      prospects.map((p) => {
        const researchStatus = deriveResearchStatus(p.linkedin_outreach);
        const outreachStatus = deriveOutreachStatusLabel(
          p.email_outreach,
          p.linkedin_outreach,
        );
        const nextAction = deriveNextAction(
          researchStatus,
          p.email_outreach,
          p.linkedin_outreach,
        );
        const lastActivity = formatLastActivity(
          p.email_outreach,
          p.linkedin_outreach,
          p.created_at,
        );
        return {
          ...p,
          researchStatus,
          outreachStatus,
          nextAction,
          lastActivity,
        };
      }),
    [prospects],
  );

  const icpOptions = useMemo(
    () => Array.from(new Set(rows.flatMap((r) => r.icp_names))).sort(),
    [rows],
  );

  const filtered = rows.filter(
    (r) =>
      (researchFilter === "all" || r.researchStatus === researchFilter) &&
      (outreachFilter === "all" || r.outreachStatus === outreachFilter) &&
      (icpFilter === "all" || r.icp_names.includes(icpFilter)),
  );

  const outreachOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.outreachStatus))).sort(),
    [rows],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Prospects"
        description="Decision-makers enriched from your saved companies, tracked through outreach."
      />

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={researchFilter}
            onValueChange={(v) => {
              setResearchFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Research Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All research statuses</SelectItem>
              {Object.entries(RESEARCH_STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={outreachFilter}
            onValueChange={(v) => {
              setOutreachFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Outreach Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outreach statuses</SelectItem>
              {outreachOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {icpOptions.length > 0 && (
            <Select
              value={icpFilter}
              onValueChange={(v) => {
                setIcpFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="ICP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ICPs</SelectItem>
                {icpOptions.map((icp) => (
                  <SelectItem key={icp} value={icp}>
                    {icp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={
            rows.length === 0
              ? "No prospects yet"
              : "No prospects match these filters"
          }
          description={
            rows.length === 0
              ? "Find decision makers at your saved companies to populate this list."
              : "Try clearing a filter to see more prospects."
          }
          action={
            rows.length === 0 ? (
              <Button asChild>
                <a href="/companies">Go to Companies</a>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>ICP</TableHead>
              <TableHead>Research</TableHead>
              <TableHead>Outreach Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Next Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => setSelectedProspectId(p.id)}
              >
                <TableCell className="font-medium">{p.name ?? "N/A"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.title ?? "N/A"}
                </TableCell>
                <TableCell>{p.company_name ?? "N/A"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.email ?? "N/A"}
                </TableCell>
                <TableCell>
                  {p.linkedin_url ? (
                    <a
                      href={
                        p.linkedin_url.startsWith("http")
                          ? p.linkedin_url
                          : `https://${p.linkedin_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Profile
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.icp_names.length > 0 ? p.icp_names.join(", ") : "N/A"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={RESEARCH_STATUS_LABEL[p.researchStatus]}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.outreachStatus} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.lastActivity}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.nextAction}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>
            Showing {currentPage * PAGE_SIZE + 1}–
            {Math.min(filtered.length, (currentPage + 1) * PAGE_SIZE)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>
            <span>
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <ProspectDetailDrawer
        prospectId={selectedProspectId}
        onOpenChange={(open) => {
          if (!open) setSelectedProspectId(null);
        }}
      />
    </div>
  );
}
