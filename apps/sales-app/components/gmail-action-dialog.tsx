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

function buildInstruction(
  prospect: IcpProspect,
  subject: string,
  context: string,
): string {
  const who = [prospect.name, prospect.title, prospect.company_name]
    .filter(Boolean)
    .join(", ");
  return (
    `Draft (do not send) an email to ${who} <${prospect.email}>. ` +
    `Subject: "${subject}". Context: ${context.trim()}. ` +
    "Show me the draft here in chat for review — do NOT call send_email yet. " +
    "Wait for me to reply approving it in a follow-up message before sending anything."
  );
}

export function GmailActionDialog({
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

  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");

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
    setSubject("");
    setContext("");
    setError(null);
  };

  const canSubmit =
    !!selectedProspectId &&
    subject.trim().length > 0 &&
    context.trim().length > 0;

  const handleSubmit = () => {
    const prospect = prospects.find((p) => p.id === selectedProspectId);
    if (!prospect) return;
    aui.thread().append(buildInstruction(prospect, subject, context));
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
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Pick a prospect and describe what the email should say — the
            assistant will draft it for your review before sending.
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
                      <CommandList className="max-h-[200px]">
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
                    <Label htmlFor={`${id}-subject`}>Subject</Label>
                    <Input
                      id={`${id}-subject`}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Quick question about your marketing stack"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${id}-context`}>
                      What should the email say?
                    </Label>
                    <Textarea
                      id={`${id}-context`}
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder='e.g. "Introduce our product, reference their recent funding round, ask for 15 minutes this week"'
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            Generate Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
