"use client";

import { useEffect, useMemo, useState } from "react";
import { useAui } from "@assistant-ui/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getIcpCompanies, getIcps, type Icp, type IcpCompany } from "@/lib/api";
import { useSalesRuntime } from "@/lib/runtime-provider";
import { cn } from "@/lib/utils";

export type EnrichMode = "companies" | "leads";

function buildLeadsInstruction(icp: Icp, companies: IcpCompany[]): string {
  const idList = companies.map((c) => c.id).join(", ");
  return (
    `Find prospects for the ICP "${icp.name}" (ID: ${icp.id}) at these ` +
    `${companies.length} specific companies: ${idList}. ` +
    "Call search_people ONCE with exactly this list as company_ids — do not call " +
    "get_companies or search_companies, these companies are already confirmed. Do not " +
    "call enrich_people_bulk or get_organization_details — search only, do not spend " +
    "enrichment credits. Report a short summary of how many people were found."
  );
}

const MODE_COPY: Record<
  EnrichMode,
  { title: string; description: string; cta: string }
> = {
  companies: {
    title: "Enrich Companies",
    description:
      "Pick an ICP to search Apollo for new companies matching its filters.",
    cta: "Enrich Companies",
  },
  leads: {
    title: "Enrich Leads",
    description:
      "Pick an ICP, then choose which of its saved companies to search for prospects.",
    cta: "Enrich Leads",
  },
};

export function EnrichDialog({
  mode,
  open,
  onOpenChange,
}: {
  mode: EnrichMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentSessionToken } = useSalesRuntime();
  const aui = useAui();
  const copy = MODE_COPY[mode];

  const [icps, setIcps] = useState<Icp[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>("");
  const [isLoadingIcps, setIsLoadingIcps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companies, setCompanies] = useState<IcpCompany[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  useEffect(() => {
    if (!open || !currentSessionToken) return;
    setIsLoadingIcps(true);
    setError(null);
    getIcps(currentSessionToken)
      .then((data) => setIcps(data))
      .catch(() => setError("Failed to load ICPs."))
      .finally(() => setIsLoadingIcps(false));
  }, [open, currentSessionToken]);

  useEffect(() => {
    if (mode !== "leads" || !selectedIcpId || !currentSessionToken) return;
    setIsLoadingCompanies(true);
    setError(null);
    getIcpCompanies(currentSessionToken, selectedIcpId)
      .then((data) => {
        setCompanies(data);
        setSelectedCompanyIds(new Set(data.map((c) => c.id)));
      })
      .catch(() => setError("Failed to load companies for this ICP."))
      .finally(() => setIsLoadingCompanies(false));
  }, [mode, selectedIcpId, currentSessionToken]);

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reset = () => {
    setSelectedIcpId("");
    setCompanies([]);
    setSelectedCompanyIds(new Set());
  };

  const canSubmit =
    mode === "companies"
      ? !!selectedIcpId
      : !!selectedIcpId && selectedCompanyIds.size > 0;

  const handleSubmit = () => {
    const icp = icps.find((i) => i.id === selectedIcpId);
    if (!icp) return;

    if (mode === "companies") {
      aui
        .thread()
        .append(
          `Find new companies for the ICP "${icp.name}" (ID: ${icp.id}). ` +
            "Call search_companies using this ICP's filters — it automatically pages " +
            "forward past companies already saved for this ICP to find new ones. Do not " +
            "call search_people, enrich_people_bulk, or get_organization_details. Report a " +
            "short summary of how many new companies were found.",
        );
    } else {
      const selected = companies.filter((c) => selectedCompanyIds.has(c.id));
      aui.thread().append(buildLeadsInstruction(icp, selected));
    }

    onOpenChange(false);
    reset();
  };

  const selectedCompanies = useMemo(
    () => companies.filter((c) => selectedCompanyIds.has(c.id)),
    [companies, selectedCompanyIds],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col",
          mode === "leads" && "sm:max-w-xl",
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoadingIcps ? (
            <p className="text-muted-foreground text-sm">Loading ICPs...</p>
          ) : error && !companies.length ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : icps.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No ICPs yet — create one via chat first.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <Select
                value={selectedIcpId}
                onValueChange={(id) => {
                  setSelectedIcpId(id);
                  setCompanies([]);
                  setSelectedCompanyIds(new Set());
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an ICP" />
                </SelectTrigger>
                <SelectContent>
                  {icps.map((icp) => (
                    <SelectItem key={icp.id} value={icp.id}>
                      {icp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {mode === "leads" && selectedIcpId && (
                <div className="flex flex-col gap-2">
                  {isLoadingCompanies ? (
                    <p className="text-muted-foreground text-sm">
                      Loading companies...
                    </p>
                  ) : error ? (
                    <p className="text-destructive text-sm">{error}</p>
                  ) : companies.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No companies saved yet for this ICP — run Enrich Companies
                      first.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          {selectedCompanyIds.size} of {companies.length}{" "}
                          companies selected
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-primary text-xs hover:underline"
                            onClick={() =>
                              setSelectedCompanyIds(
                                new Set(companies.map((c) => c.id)),
                              )
                            }
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            className="text-primary text-xs hover:underline"
                            onClick={() => setSelectedCompanyIds(new Set())}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <Command className="rounded-md border">
                        <CommandInput placeholder="Search companies..." />
                        <CommandList className="max-h-[280px]">
                          <CommandEmpty>No companies match.</CommandEmpty>
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={`${company.name ?? ""} ${company.domain ?? ""}`}
                              onSelect={() => toggleCompany(company.id)}
                              className="gap-2"
                            >
                              <Checkbox
                                checked={selectedCompanyIds.has(company.id)}
                                onCheckedChange={() =>
                                  toggleCompany(company.id)
                                }
                              />
                              <span className="truncate">
                                {company.name ?? "—"}
                              </span>
                              {company.domain && (
                                <span className="truncate text-muted-foreground text-xs">
                                  {company.domain}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {mode === "leads" && selectedCompanies.length > 0
              ? `${copy.cta} (${selectedCompanies.length})`
              : copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
