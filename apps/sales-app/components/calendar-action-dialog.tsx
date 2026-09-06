"use client";

import { useEffect, useId, useState } from "react";
import { CheckIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getIcpProspects,
  getIcps,
  type Icp,
  type IcpProspect,
} from "@/lib/api";
import { useSalesRuntime } from "@/lib/runtime-provider";
import { cn } from "@/lib/utils";

const DURATIONS = [15, 30, 45, 60] as const;

function formatProposedTime(localDateTime: string, durationMinutes: number) {
  const start = new Date(localDateTime);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fmt = (d: Date) =>
    d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  return `${fmt(start)} to ${fmt(end)} (${timeZone})`;
}

function buildInstruction(
  prospect: IcpProspect,
  title: string,
  localDateTime: string,
  durationMinutes: number,
  notes: string,
): string {
  const who = [prospect.name, prospect.title, prospect.company_name]
    .filter(Boolean)
    .join(", ");
  return (
    `Propose a meeting with ${who} <${prospect.email}>. Title: "${title}". ` +
    `Proposed time: ${formatProposedTime(localDateTime, durationMinutes)}. ` +
    (notes.trim() ? `Notes: ${notes.trim()}. ` : "") +
    "First check my availability for that time with get_availability. Then show me " +
    "the proposed meeting details here in chat for review — do NOT call create_event " +
    "yet. Wait for me to reply approving it before creating anything."
  );
}

export function CalendarActionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentSessionToken } = useSalesRuntime();
  const aui = useAui();
  const id = useId();

  const [icps, setIcps] = useState<Icp[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>("");
  const [isLoadingIcps, setIsLoadingIcps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prospects, setProspects] = useState<IcpProspect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<string>("");
  const [isLoadingProspects, setIsLoadingProspects] = useState(false);

  const [title, setTitle] = useState("");
  const [localDateTime, setLocalDateTime] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState("");

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
    if (!selectedIcpId || !currentSessionToken) return;
    setIsLoadingProspects(true);
    setError(null);
    getIcpProspects(currentSessionToken, selectedIcpId)
      .then((data) => setProspects(data.filter((p) => !!p.email)))
      .catch(() => setError("Failed to load prospects for this ICP."))
      .finally(() => setIsLoadingProspects(false));
  }, [selectedIcpId, currentSessionToken]);

  const reset = () => {
    setSelectedIcpId("");
    setProspects([]);
    setSelectedProspectId("");
    setTitle("");
    setLocalDateTime("");
    setDuration(30);
    setNotes("");
    setError(null);
  };

  const canSubmit =
    !!selectedProspectId && title.trim().length > 0 && !!localDateTime;

  const handleSubmit = () => {
    const prospect = prospects.find((p) => p.id === selectedProspectId);
    if (!prospect) return;
    aui
      .thread()
      .append(
        buildInstruction(prospect, title, localDateTime, duration, notes),
      );
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Schedule Meeting</DialogTitle>
          <DialogDescription>
            Pick a prospect and propose a time — the assistant will check your
            availability and show you the proposal before creating it.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoadingIcps ? (
            <p className="text-muted-foreground text-sm">Loading ICPs...</p>
          ) : icps.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No ICPs yet — create one first.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <Select
                value={selectedIcpId}
                onValueChange={(icpId) => {
                  setSelectedIcpId(icpId);
                  setProspects([]);
                  setSelectedProspectId("");
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

              {selectedIcpId && (
                <>
                  {isLoadingProspects ? (
                    <p className="text-muted-foreground text-sm">
                      Loading prospects...
                    </p>
                  ) : error ? (
                    <p className="text-destructive text-sm">{error}</p>
                  ) : prospects.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No prospects with an email for this ICP yet — run Enrich
                      Leads first.
                    </p>
                  ) : (
                    <Command className="rounded-md border">
                      <CommandInput placeholder="Search prospects..." />
                      <CommandList className="max-h-[180px]">
                        <CommandEmpty>No prospects match.</CommandEmpty>
                        {prospects.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={`${p.name ?? ""} ${p.title ?? ""} ${p.company_name ?? ""}`}
                            onSelect={() => setSelectedProspectId(p.id)}
                            className="gap-2"
                          >
                            <CheckIcon
                              className={cn(
                                "size-4 shrink-0",
                                selectedProspectId === p.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="truncate">{p.name ?? "—"}</span>
                            <span className="truncate text-muted-foreground text-xs">
                              {[p.title, p.company_name]
                                .filter(Boolean)
                                .join(" @ ")}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${id}-title`}>Meeting title</Label>
                    <Input
                      id={`${id}-title`}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Intro call"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`${id}-datetime`}>Proposed time</Label>
                      <Input
                        id={`${id}-datetime`}
                        type="datetime-local"
                        value={localDateTime}
                        onChange={(e) => setLocalDateTime(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`${id}-duration`}>Duration</Label>
                      <Select
                        value={String(duration)}
                        onValueChange={(v) => setDuration(Number(v))}
                      >
                        <SelectTrigger id={`${id}-duration`} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {d} min
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${id}-notes`}>Notes (optional)</Label>
                    <Textarea
                      id={`${id}-notes`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What do you want to discuss?"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            Propose Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
