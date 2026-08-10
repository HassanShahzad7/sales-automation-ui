"use client";

import type { N8nWorkflow, N8nExecution } from "@/lib/n8n";
import { WorkflowRow } from "./workflow-row";

type Props = {
  workflows: N8nWorkflow[];
  executions: Record<string, N8nExecution | null>;
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
};

const HEADERS = ["Workflow", "Status", "Last Run", "Result", "Actions"];

export function WorkflowTable({
  workflows,
  executions,
  isLoading,
  error,
  onDelete,
  onToggle,
}: Props) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-left">
        <thead className="border-border border-b bg-muted/50">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <tr key={i} className="border-border border-b last:border-0">
                {HEADERS.map((h) => (
                  <td key={h} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))
          ) : workflows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-muted-foreground text-sm"
              >
                No workflows found. Create one in n8n to get started.
              </td>
            </tr>
          ) : (
            workflows.map((wf) => (
              <WorkflowRow
                key={wf.id}
                workflow={wf}
                lastExecution={executions[wf.id] ?? null}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
