"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Workflows"
        description="Manage your n8n automation workflows"
        actions={
          <Button asChild>
            <a
              href={n8nNewWorkflowUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="size-4" />
              New Workflow
            </a>
          </Button>
        }
      />

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
