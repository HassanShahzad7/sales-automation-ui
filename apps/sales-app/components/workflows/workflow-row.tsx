"use client";

import { useState } from "react";
import { ExternalLinkIcon, PlayIcon, Trash2Icon } from "lucide-react";
import type { N8nWorkflow, N8nExecution } from "@/lib/n8n";
import {
  activateWorkflow,
  deactivateWorkflow,
  executeWorkflow,
  deleteWorkflow,
  n8nWorkflowUrl,
} from "@/lib/n8n";

type Props = {
  workflow: N8nWorkflow;
  lastExecution: N8nExecution | null;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function WorkflowRow({
  workflow,
  lastExecution,
  onDelete,
  onToggle,
}: Props) {
  const [isToggling, setIsToggling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleToggle() {
    setIsToggling(true);
    setActionError(null);
    try {
      if (workflow.active) {
        await deactivateWorkflow(workflow.id);
        onToggle(workflow.id, false);
      } else {
        await activateWorkflow(workflow.id);
        onToggle(workflow.id, true);
      }
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to toggle workflow",
      );
    } finally {
      setIsToggling(false);
    }
  }

  async function handleRun() {
    setIsRunning(true);
    setActionError(null);
    try {
      await executeWorkflow(workflow.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to run workflow");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteWorkflow(workflow.id);
      onDelete(workflow.id);
      setShowConfirm(false);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to delete workflow",
      );
      setIsDeleting(false);
    }
  }

  const statusColor = workflow.active
    ? "bg-green-100 text-green-700"
    : "bg-muted text-muted-foreground";

  const resultColor =
    lastExecution == null
      ? "bg-muted text-muted-foreground"
      : lastExecution.status === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

  const resultLabel =
    lastExecution == null
      ? "Never run"
      : lastExecution.status === "success"
        ? "✓ Success"
        : "✗ Failed";

  const lastRunLabel = lastExecution?.startedAt
    ? relativeTime(lastExecution.startedAt)
    : "—";

  return (
    <>
      <tr className="border-border border-b transition-colors last:border-0 hover:bg-muted/30">
        <td className="px-4 py-3 font-medium text-foreground text-sm">
          {workflow.name}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-xs ${statusColor}`}
          >
            <span
              className={`size-1.5 rounded-full ${workflow.active ? "bg-green-500" : "bg-muted-foreground"}`}
            />
            {workflow.active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground text-sm">
          {lastRunLabel}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${resultColor}`}
          >
            {resultLabel}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {/* Toggle */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={isToggling}
              title={workflow.active ? "Deactivate" : "Activate"}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                workflow.active ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg transition-transform ${
                  workflow.active ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            {/* Run */}
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              title="Run now"
              className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {isRunning ? (
                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <PlayIcon className="size-3" />
              )}
            </button>
            {/* Open in n8n */}
            <a
              href={n8nWorkflowUrl(workflow.id)}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in n8n"
              className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLinkIcon className="size-3" />
            </a>
            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              title="Delete workflow"
              className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Trash2Icon className="size-3" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* Confirm delete dialog */}
      {showConfirm && (
        <tr>
          <td colSpan={5} className="bg-destructive/5 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-foreground text-sm">
                Delete <strong>{workflow.name}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-md px-3 py-1 text-muted-foreground text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-md bg-destructive px-3 py-1 text-destructive-foreground text-sm hover:bg-destructive/90 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Inline error message */}
      {actionError && (
        <tr>
          <td colSpan={5} className="px-4 py-2">
            <p className="text-destructive text-xs">{actionError}</p>
          </td>
        </tr>
      )}
    </>
  );
}
