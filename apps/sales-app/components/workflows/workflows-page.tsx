"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import {
  listWorkflows,
  getLastExecution,
  n8nNewWorkflowUrl,
  type N8nWorkflow,
  type N8nExecution,
} from "@/lib/n8n";
import { WorkflowFilters, type WorkflowFilter } from "./workflow-filters";
import { WorkflowTable } from "./workflow-table";

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<
    Record<string, N8nExecution | null>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WorkflowFilter>("all");

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wfs = await listWorkflows();
      setWorkflows(wfs);
      // Fetch last execution for each workflow in parallel
      const execEntries = await Promise.all(
        wfs.map(async (wf) => {
          const exec = await getLastExecution(wf.id).catch(() => null);
          return [wf.id, exec] as const;
        }),
      );
      setExecutions(Object.fromEntries(execEntries));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError(
          `Cannot connect to n8n at ${process.env.NEXT_PUBLIC_N8N_URL ?? "http://localhost:5678"}. Make sure n8n is running.`,
        );
      } else if (msg.includes("401") || msg.includes("403")) {
        setError("n8n API key is invalid. Check NEXT_PUBLIC_N8N_API_KEY.");
      } else {
        setError(`Failed to load workflows: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleDelete = useCallback((id: string) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
  }, []);

  const handleToggle = useCallback((id: string, active: boolean) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, active } : wf)),
    );
  }, []);

  const filtered = useMemo(() => {
    if (filter === "active") return workflows.filter((wf) => wf.active);
    if (filter === "inactive") return workflows.filter((wf) => !wf.active);
    return workflows;
  }, [workflows, filter]);

  const counts = useMemo(
    () => ({
      all: workflows.length,
      active: workflows.filter((wf) => wf.active).length,
      inactive: workflows.filter((wf) => !wf.active).length,
    }),
    [workflows],
  );

  return (
    <div className="flex h-dvh flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-foreground text-xl">Workflows</h1>
          <p className="text-muted-foreground text-sm">
            Manage your n8n automation workflows
          </p>
        </div>
        <a
          href={n8nNewWorkflowUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
        >
          <ExternalLinkIcon className="size-4" />
          New Workflow
        </a>
      </div>

      {/* Filters */}
      {!error && (
        <WorkflowFilters filter={filter} counts={counts} onChange={setFilter} />
      )}

      {/* Table */}
      <WorkflowTable
        workflows={filtered}
        executions={executions}
        isLoading={isLoading}
        error={error}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />
    </div>
  );
}
