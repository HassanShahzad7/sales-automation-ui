"use client";

import { useMemo, useState } from "react";
import {
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
import { useCompanies } from "@/lib/use-workspace-data";

const PAGE_SIZE = 50;

export function CompaniesPage() {
  const { companies, isLoading, error } = useCompanies();
  const [icpFilter, setIcpFilter] = useState("all");
  const [page, setPage] = useState(0);

  const icpOptions = useMemo(
    () => Array.from(new Set(companies.flatMap((c) => c.icp_names))).sort(),
    [companies],
  );

  const filtered = companies.filter(
    (c) => icpFilter === "all" || c.icp_names.includes(icpFilter),
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
        title="Companies"
        description="Companies matched against your ICPs and enriched via Apollo."
      />

      {icpOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={icpFilter}
            onValueChange={(v) => {
              setIcpFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-48">
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
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={Building2Icon}
          title={
            companies.length === 0
              ? "No companies yet"
              : "No companies match this filter"
          }
          description={
            companies.length === 0
              ? "Create an ICP to start finding companies that match your ideal customer profile."
              : "Try clearing the ICP filter to see more companies."
          }
          action={
            companies.length === 0 ? (
              <Button asChild>
                <a href="/icps">Go to ICPs</a>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Founded</TableHead>
              <TableHead>ICP(s)</TableHead>
              <TableHead>Prospects Found</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name ?? "N/A"}</TableCell>
                <TableCell>
                  {c.domain ? (
                    <a
                      href={`https://${c.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {c.domain}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.employee_range ?? "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.revenue_range ?? "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.founded_year ?? "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.icp_names.length > 0 ? c.icp_names.join(", ") : "N/A"}
                </TableCell>
                <TableCell>{c.prospects_count}</TableCell>
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
    </div>
  );
}
