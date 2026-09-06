"use client";

import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createIcp, type CreateIcpResult } from "@/lib/api";
import { addDemoIcp } from "@/lib/demo-icps";
import { useSalesRuntime } from "@/lib/runtime-provider";
import { useWorkspace } from "@/lib/workspace-context";

const SENIORITIES = [
  "owner",
  "founder",
  "c_suite",
  "partner",
  "vp",
  "head",
  "director",
  "manager",
  "senior",
  "entry",
  "intern",
] as const;

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumberOrUndefined(value: string): number | undefined {
  const n = Number(value);
  return value.trim() !== "" && !Number.isNaN(n) ? n : undefined;
}

export function CreateIcpDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const { currentSessionToken } = useSalesRuntime();
  const { isDemo } = useWorkspace();
  const id = useId();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keywordTags, setKeywordTags] = useState("");
  const [locations, setLocations] = useState("");
  const [minEmployees, setMinEmployees] = useState("");
  const [maxEmployees, setMaxEmployees] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const [personTitles, setPersonTitles] = useState("");
  const [seniorities, setSeniorities] = useState<Set<string>>(new Set());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateIcpResult | null>(null);

  const toggleSeniority = (s: string) => {
    setSeniorities((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const reset = () => {
    setName("");
    setDescription("");
    setKeywordTags("");
    setLocations("");
    setMinEmployees("");
    setMaxEmployees("");
    setMinRevenue("");
    setMaxRevenue("");
    setPersonTitles("");
    setSeniorities(new Set());
    setError(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (!isDemo && !currentSessionToken) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    if (isDemo) {
      const demoId = `demo-icp-${Date.now()}`;
      addDemoIcp({
        id: demoId,
        name: name.trim(),
        description: description.trim() || null,
      });
      setResult({ success: true, icp_id: demoId, name: name.trim() });
      onCreated?.();
      setIsSubmitting(false);
      return;
    }

    const companyFilters: Record<string, unknown> = {};
    const keywordList = splitList(keywordTags);
    if (keywordList.length)
      companyFilters.q_organization_keyword_tags = keywordList;
    const locationList = splitList(locations);
    if (locationList.length)
      companyFilters.organization_locations = locationList;
    const minEmp = toNumberOrUndefined(minEmployees);
    const maxEmp = toNumberOrUndefined(maxEmployees);
    if (minEmp !== undefined || maxEmp !== undefined) {
      companyFilters.organization_num_employees_ranges = [
        { min: minEmp, max: maxEmp },
      ];
    }
    const minRev = toNumberOrUndefined(minRevenue);
    const maxRev = toNumberOrUndefined(maxRevenue);
    if (minRev !== undefined || maxRev !== undefined) {
      companyFilters.revenue_range = { min: minRev, max: maxRev };
    }

    const peopleFilters: Record<string, unknown> = {};
    const titleList = splitList(personTitles);
    if (titleList.length) peopleFilters.person_titles = titleList;
    if (seniorities.size)
      peopleFilters.person_seniorities = Array.from(seniorities);

    try {
      const trimmedDescription = description.trim();
      const created = await createIcp(currentSessionToken as string, {
        name: name.trim(),
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        company_filters: companyFilters,
        people_filters: peopleFilters,
      });
      setResult(created);
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create ICP");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create ICP</DialogTitle>
          <DialogDescription>
            Define who you're targeting. Leave fields blank to skip them — more
            advanced Apollo filters can still be set via chat later.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {result ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm">
                Created <span className="font-medium">{result.name}</span>.
              </p>
              {typeof result.estimated_company_matches === "number" && (
                <p className="text-muted-foreground text-sm">
                  Estimated matches on Apollo:{" "}
                  {result.estimated_company_matches.toLocaleString()}
                </p>
              )}
              {result.warning && (
                <p className="text-sm text-yellow-600">{result.warning}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-name`}>Name *</Label>
                <Input
                  id={`${id}-name`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. "US Mid-Market Fintech CFOs"'
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-description`}>Description</Label>
                <Textarea
                  id={`${id}-description`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Who is this ICP for, and why?"
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-keywords`}>Company keywords</Label>
                <Input
                  id={`${id}-keywords`}
                  value={keywordTags}
                  onChange={(e) => setKeywordTags(e.target.value)}
                  placeholder="marketing, advertising, digital marketing"
                />
                <p className="text-muted-foreground text-xs">
                  Comma-separated. Prefer broad single words over narrow phrases
                  like "marketing agency" — they collapse match counts.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-locations`}>Company locations</Label>
                <Input
                  id={`${id}-locations`}
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="United States, Canada"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${id}-min-employees`}>Min employees</Label>
                  <Input
                    id={`${id}-min-employees`}
                    type="number"
                    value={minEmployees}
                    onChange={(e) => setMinEmployees(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${id}-max-employees`}>Max employees</Label>
                  <Input
                    id={`${id}-max-employees`}
                    type="number"
                    value={maxEmployees}
                    onChange={(e) => setMaxEmployees(e.target.value)}
                    placeholder="leave blank for no cap"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${id}-min-revenue`}>Min revenue (USD)</Label>
                  <Input
                    id={`${id}-min-revenue`}
                    type="number"
                    value={minRevenue}
                    onChange={(e) => setMinRevenue(e.target.value)}
                    placeholder="10000000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${id}-max-revenue`}>Max revenue (USD)</Label>
                  <Input
                    id={`${id}-max-revenue`}
                    type="number"
                    value={maxRevenue}
                    onChange={(e) => setMaxRevenue(e.target.value)}
                    placeholder="1000000000"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-titles`}>Target job titles</Label>
                <Input
                  id={`${id}-titles`}
                  value={personTitles}
                  onChange={(e) => setPersonTitles(e.target.value)}
                  placeholder="CMO, Marketing Manager"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label id={`${id}-seniorities-label`}>Target seniorities</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {SENIORITIES.map((s) => (
                    <Label
                      key={s}
                      htmlFor={`${id}-seniority-${s}`}
                      className="flex items-center gap-1.5 font-normal text-sm capitalize"
                    >
                      <Checkbox
                        id={`${id}-seniority-${s}`}
                        checked={seniorities.has(s)}
                        onCheckedChange={() => toggleSeniority(s)}
                      />
                      {s.replace("_", " ")}
                    </Label>
                  ))}
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          {result ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!name.trim() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Creating..." : "Create ICP"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
