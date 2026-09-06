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

export type LinkedInAction = "view_profile" | "connect" | "draft_message";

const ACTION_COPY: Record<
  LinkedInAction,
  { title: string; description: string; cta: string; needsContext: boolean }
> = {
  view_profile: {
    title: "View LinkedIn Profile",
    description:
      "Pick a prospect to view and summarize their LinkedIn profile.",
    cta: "View Profile",
    needsContext: false,
  },
  connect: {
    title: "Send Connection Request",
    description: "Pick a prospect to send a LinkedIn connection request to.",
    cta: "Send Request",
    needsContext: false,
  },
  draft_message: {
    title: "Draft LinkedIn Message",
    description:
      "Pick a prospect and describe what you want to say — the assistant will draft it for your review before sending.",
    cta: "Draft Message",
    needsContext: true,
  },
};

function buildInstruction(
  action: LinkedInAction,
  prospect: IcpProspect,
  context: string,
): string {
  const who = [prospect.name, prospect.title, prospect.company_name]
    .filter(Boolean)
    .join(", ");

  switch (action) {
    case "view_profile":
      return `View this LinkedIn profile and summarize what you find about them: ${prospect.linkedin_url} (${who}).`;
    case "connect":
      return `Send a LinkedIn connection request to ${who} (${prospect.linkedin_url}).`;
    case "draft_message":
      return (
        `Draft (do not send) a LinkedIn message to ${who} (${prospect.linkedin_url}). ` +
        (context.trim() ? `Context: ${context.trim()}. ` : "") +
        "Just write the draft text here in chat as your reply — do NOT call " +
        "linkedin_send_message yet. Wait for me to reply approving it in a " +
        "follow-up message before sending anything."
      );
  }
}

export function LinkedInActionDialog({
  action,
  open,
  onOpenChange,
}: {
  action: LinkedInAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentSessionToken } = useSalesRuntime();
  const aui = useAui();
  const id = useId();
  const copy = ACTION_COPY[action];

  const [icps, setIcps] = useState<Icp[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>("");
  const [isLoadingIcps, setIsLoadingIcps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prospects, setProspects] = useState<IcpProspect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<string>("");
  const [isLoadingProspects, setIsLoadingProspects] = useState(false);

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
      .then((data) =>
        setProspects(
          data.filter(
            (p): p is IcpProspect & { linkedin_url: string } =>
              !!p.linkedin_url,
          ),
        ),
      )
      .catch(() => setError("Failed to load prospects for this ICP."))
      .finally(() => setIsLoadingProspects(false));
  }, [selectedIcpId, currentSessionToken]);

  const reset = () => {
    setSelectedIcpId("");
    setProspects([]);
    setSelectedProspectId("");
    setContext("");
    setError(null);
  };

  const canSubmit =
    !!selectedProspectId && (!copy.needsContext || context.trim().length > 0);

  const handleSubmit = () => {
    const prospect = prospects.find((p) => p.id === selectedProspectId);
    if (!prospect) return;
    aui.thread().append(buildInstruction(action, prospect, context));
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
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
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
                      No prospects with a LinkedIn URL for this ICP yet — run
                      Enrich Leads first.
                    </p>
                  ) : (
                    <Command className="rounded-md border">
                      <CommandInput placeholder="Search prospects..." />
                      <CommandList className="max-h-[240px]">
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

                  {copy.needsContext && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`${id}-context`}>
                        What should the message say?
                      </Label>
                      <Textarea
                        id={`${id}-context`}
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder='e.g. "Congratulate them on their recent product launch and ask for 15 minutes to discuss how we could help with X"'
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
