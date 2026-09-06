"use client";

import { CheckIcon, LoaderIcon } from "lucide-react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function parseJson<T>(result: unknown): T | null {
  if (typeof result !== "string") return null;
  try {
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}

function StatusIcon({ isRunning }: { isRunning: boolean }) {
  return isRunning ? (
    <LoaderIcon className="size-4 shrink-0 animate-spin text-muted-foreground" />
  ) : (
    <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
  );
}

type CompanyPreview = {
  name: string | null;
  domain: string | null;
  company_id: string;
};
type SearchCompaniesResult = {
  success?: boolean;
  total_entries?: number;
  new_companies_saved?: number;
  credits_used?: number;
  companies_preview?: CompanyPreview[];
  note?: string;
};

export const SearchCompaniesToolUI = makeAssistantToolUI<
  Record<string, unknown>,
  string
>({
  toolName: "search_companies",
  render: (props) => {
    const { status, result } = props;
    const parsed = parseJson<SearchCompaniesResult>(result);
    if (!parsed?.success || !parsed.companies_preview) {
      return <ToolFallback {...props} />;
    }
    const isRunning = status?.type === "running";

    return (
      <div className="w-full rounded-lg border py-3">
        <div className="flex items-center gap-2 px-4 text-sm">
          <StatusIcon isRunning={isRunning} />
          <span>
            Found {parsed.total_entries ?? parsed.companies_preview.length}{" "}
            companies
            {typeof parsed.new_companies_saved === "number"
              ? ` · ${parsed.new_companies_saved} new`
              : ""}
            {typeof parsed.credits_used === "number"
              ? ` · ${parsed.credits_used} credit(s) used`
              : ""}
          </span>
        </div>
        {parsed.note && (
          <p className="px-4 pt-1 text-muted-foreground text-sm italic">
            {parsed.note}
          </p>
        )}
        {parsed.companies_preview.length > 0 && (
          <div className="mt-2 max-h-[400px] overflow-y-auto border-t px-4 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.companies_preview.map((c) => (
                  <TableRow key={c.company_id}>
                    <TableCell>{c.name ?? "—"}</TableCell>
                    <TableCell>{c.domain ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  },
});

type Candidate = {
  prospect_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  seniority: string | null;
  email?: string | null;
  email_status?: string | null;
  linkedin_url: string | null;
};
type CompanyPeopleResult = {
  company_id: string;
  company_name?: string;
  total_found?: number;
  candidates?: Candidate[];
  error?: string;
};
type SearchPeopleResult = {
  success?: boolean;
  results?: CompanyPeopleResult[];
};

type PersonRow = Candidate & { company_name: string };

export const SearchPeopleToolUI = makeAssistantToolUI<
  Record<string, unknown>,
  string
>({
  toolName: "search_people",
  render: (props) => {
    const { status, result } = props;
    const parsed = parseJson<SearchPeopleResult>(result);
    if (!parsed?.success || !parsed.results) {
      return <ToolFallback {...props} />;
    }
    const isRunning = status?.type === "running";

    const rows: PersonRow[] = parsed.results.flatMap((company) =>
      (company.candidates ?? []).map((p) => ({
        ...p,
        company_name: company.company_name ?? company.company_id,
      })),
    );
    const companyErrors = parsed.results.filter((c) => c.error);
    const totalFound = parsed.results.reduce(
      (sum, c) => sum + (c.total_found ?? c.candidates?.length ?? 0),
      0,
    );

    return (
      <div className="w-full rounded-lg border py-3">
        <div className="flex items-center gap-2 px-4 text-sm">
          <StatusIcon isRunning={isRunning} />
          <span>
            Found {totalFound || rows.length} prospects across{" "}
            {parsed.results.length} companies
          </span>
        </div>
        {companyErrors.length > 0 && (
          <p className="px-4 pt-1 text-destructive text-sm">
            {companyErrors.length} companies could not be searched (e.g.{" "}
            {companyErrors[0]?.error})
          </p>
        )}
        {rows.length > 0 ? (
          <div className="mt-2 max-h-[500px] overflow-y-auto border-t px-4 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead>Email Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.prospect_id}>
                    <TableCell>{p.first_name ?? "—"}</TableCell>
                    <TableCell>{p.last_name ?? "—"}</TableCell>
                    <TableCell>{p.company_name}</TableCell>
                    <TableCell>{p.title ?? "—"}</TableCell>
                    <TableCell>{p.email ?? "—"}</TableCell>
                    <TableCell>
                      {p.linkedin_url ? (
                        <a
                          href={p.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{p.email_status ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="px-4 pt-1 text-muted-foreground text-sm">
            No prospects found.
          </p>
        )}
      </div>
    );
  },
});
