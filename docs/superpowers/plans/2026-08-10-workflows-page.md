# Workflows Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Workflows page to Sales Assistant that lets users monitor, enable/disable, trigger, and delete n8n workflows without leaving the app.

**Architecture:** A new Next.js route `/workflows` with a pure-frontend implementation — the page calls n8n's REST API directly from the browser using an API key from env vars. The existing `SessionsSidebar` gains an "Automation" section with a Workflows nav link. No backend changes required.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, plain `fetch` for n8n API calls, lucide-react icons.

---

## File Map

**New files:**
- `apps/sales-app/lib/n8n.ts` — n8n API client: types + fetch wrapper
- `apps/sales-app/app/workflows/page.tsx` — `/workflows` route (auth guard + layout)
- `apps/sales-app/components/workflows/workflow-filters.tsx` — All / Active / Inactive tab filter
- `apps/sales-app/components/workflows/workflow-row.tsx` — single workflow table row with all actions
- `apps/sales-app/components/workflows/workflow-table.tsx` — table shell + loading/error/empty states
- `apps/sales-app/components/workflows/workflows-page.tsx` — full page: header, filters, table, data fetching

**Modified files:**
- `apps/sales-app/components/chat-ui.tsx` — add "Automation" section + Workflows nav item to sidebar

---

## Task 1: n8n API client (`lib/n8n.ts`)

**Files:**
- Create: `apps/sales-app/lib/n8n.ts`

- [ ] **Step 1: Create the file with types and fetch helper**

```typescript
// apps/sales-app/lib/n8n.ts

const N8N_URL = () =>
  process.env.NEXT_PUBLIC_N8N_URL ?? "http://localhost:5678";

const N8N_API_KEY = () =>
  process.env.NEXT_PUBLIC_N8N_API_KEY ?? "";

export type N8nWorkflow = {
  id: string;
  name: string;
  active: boolean;
  updatedAt: string;
  createdAt: string;
};

export type N8nExecution = {
  id: string;
  finished: boolean;
  mode: string;
  status: "success" | "error" | "waiting" | "running" | "new";
  startedAt: string;
  stoppedAt: string | null;
};

type N8nListResponse<T> = {
  data: T[];
  nextCursor: string | null;
};

async function n8nFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${N8N_URL()}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": N8N_API_KEY(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listWorkflows(): Promise<N8nWorkflow[]> {
  const data = await n8nFetch<N8nListResponse<N8nWorkflow>>("/workflows");
  return data.data;
}

export async function activateWorkflow(id: string): Promise<N8nWorkflow> {
  return n8nFetch<N8nWorkflow>(`/workflows/${id}/activate`, {
    method: "POST",
  });
}

export async function deactivateWorkflow(id: string): Promise<N8nWorkflow> {
  return n8nFetch<N8nWorkflow>(`/workflows/${id}/deactivate`, {
    method: "POST",
  });
}

export async function executeWorkflow(id: string): Promise<void> {
  await n8nFetch<void>(`/workflows/${id}/run`, { method: "POST" });
}

export async function deleteWorkflow(id: string): Promise<void> {
  await n8nFetch<void>(`/workflows/${id}`, { method: "DELETE" });
}

export async function getLastExecution(
  workflowId: string,
): Promise<N8nExecution | null> {
  const data = await n8nFetch<N8nListResponse<N8nExecution>>(
    `/executions?workflowId=${workflowId}&limit=1&includeData=false`,
  );
  return data.data[0] ?? null;
}

export function n8nWorkflowUrl(id: string): string {
  return `${N8N_URL()}/workflow/${id}`;
}

export function n8nNewWorkflowUrl(): string {
  return `${N8N_URL()}/workflow/new`;
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/I769817/Hassan/Sales Automation/sales-automation-ui"
git add apps/sales-app/lib/n8n.ts
git commit -m "feat: add n8n API client with types and fetch helpers"
```

---

## Task 2: Workflow filter tabs (`components/workflows/workflow-filters.tsx`)

**Files:**
- Create: `apps/sales-app/components/workflows/workflow-filters.tsx`

- [ ] **Step 1: Create the filter component**

```typescript
// apps/sales-app/components/workflows/workflow-filters.tsx
"use client";

export type WorkflowFilter = "all" | "active" | "inactive";

type Props = {
  filter: WorkflowFilter;
  counts: { all: number; active: number; inactive: number };
  onChange: (filter: WorkflowFilter) => void;
};

const TABS: { key: WorkflowFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export function WorkflowFilters({ filter, counts, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === tab.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label} ({counts[tab.key]})
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/sales-app/components/workflows/workflow-filters.tsx
git commit -m "feat: add workflow filter tabs component"
```

---

## Task 3: Workflow row (`components/workflows/workflow-row.tsx`)

**Files:**
- Create: `apps/sales-app/components/workflows/workflow-row.tsx`

- [ ] **Step 1: Create the row component**

```typescript
// apps/sales-app/components/workflows/workflow-row.tsx
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

export function WorkflowRow({ workflow, lastExecution, onDelete, onToggle }: Props) {
  const [isToggling, setIsToggling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleToggle() {
    setIsToggling(true);
    try {
      if (workflow.active) {
        await deactivateWorkflow(workflow.id);
        onToggle(workflow.id, false);
      } else {
        await activateWorkflow(workflow.id);
        onToggle(workflow.id, true);
      }
    } finally {
      setIsToggling(false);
    }
  }

  async function handleRun() {
    setIsRunning(true);
    try {
      await executeWorkflow(workflow.id);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleDelete() {
    await deleteWorkflow(workflow.id);
    onDelete(workflow.id);
    setShowConfirm(false);
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
      <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 text-sm font-medium text-foreground">
          {workflow.name}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
            <span className={`size-1.5 rounded-full ${workflow.active ? "bg-green-500" : "bg-muted-foreground"}`} />
            {workflow.active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{lastRunLabel}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resultColor}`}>
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
              title="Delete workflow"
              className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon className="size-3" />
            </button>
          </div>
        </td>
      </tr>

      {/* Confirm delete dialog */}
      {showConfirm && (
        <tr>
          <td colSpan={5} className="bg-destructive/5 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-foreground">
                Delete <strong>{workflow.name}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md bg-destructive px-3 py-1 text-sm text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/sales-app/components/workflows/workflow-row.tsx
git commit -m "feat: add workflow row component with toggle, run, open, delete actions"
```

---

## Task 4: Workflow table (`components/workflows/workflow-table.tsx`)

**Files:**
- Create: `apps/sales-app/components/workflows/workflow-table.tsx`

- [ ] **Step 1: Create the table component**

```typescript
// apps/sales-app/components/workflows/workflow-table.tsx
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
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
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
                className="px-4 py-10 text-center text-sm text-muted-foreground"
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/sales-app/components/workflows/workflow-table.tsx
git commit -m "feat: add workflow table with loading, empty, and error states"
```

---

## Task 5: Workflows page component (`components/workflows/workflows-page.tsx`)

**Files:**
- Create: `apps/sales-app/components/workflows/workflows-page.tsx`

- [ ] **Step 1: Create the page component with data fetching**

```typescript
// apps/sales-app/components/workflows/workflows-page.tsx
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
  const [executions, setExecutions] = useState<Record<string, N8nExecution | null>>({});
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
          <h1 className="text-xl font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Manage your n8n automation workflows
          </p>
        </div>
        <a
          href={n8nNewWorkflowUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/sales-app/components/workflows/workflows-page.tsx
git commit -m "feat: add workflows page component with data fetching and filter state"
```

---

## Task 6: Next.js route (`app/workflows/page.tsx`)

**Files:**
- Create: `apps/sales-app/app/workflows/page.tsx`

- [ ] **Step 1: Create the route with auth guard**

```typescript
// apps/sales-app/app/workflows/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { WorkflowsPage } from "@/components/workflows/workflows-page";

export default function WorkflowsRoute() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.userToken) {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) return null;

  return <WorkflowsPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/sales-app/app/workflows/page.tsx
git commit -m "feat: add /workflows route with auth guard"
```

---

## Task 7: Add Workflows nav to sidebar (`components/chat-ui.tsx`)

**Files:**
- Modify: `apps/sales-app/components/chat-ui.tsx`

- [ ] **Step 1: Add imports at the top of the file**

Add `WorkflowIcon` and `useRouter` to the existing imports:

```typescript
// At the top of chat-ui.tsx, replace the existing imports with:
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAssistantRuntime } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { useSalesRuntime } from "@/lib/runtime-provider";
import {
  LogOutIcon,
  MessageSquareIcon,
  PlusIcon,
  TrashIcon,
  WorkflowIcon,
} from "lucide-react";
```

- [ ] **Step 2: Add `useRouter` and `usePathname` inside `SessionsSidebar`**

After the existing `const runtime = useAssistantRuntime();` line, add:

```typescript
  const router = useRouter();
  const pathname = usePathname();
```

- [ ] **Step 3: Add the Automation section to the sidebar JSX**

Inside the `<aside>` element, after the closing `</div>` of the sessions list (after `</div>` that wraps the `flex-1 overflow-y-auto` div), add:

```tsx
      {/* Automation section */}
      <div className="border-t border-sidebar-border px-3 py-2">
        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/40">
          Automation
        </p>
        <button
          type="button"
          onClick={() => router.push("/workflows")}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent ${
            pathname === "/workflows"
              ? "bg-sidebar-accent font-medium text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
          }`}
        >
          <WorkflowIcon className="size-4 shrink-0" />
          Workflows
        </button>
      </div>
```

- [ ] **Step 4: Commit**

```bash
git add apps/sales-app/components/chat-ui.tsx
git commit -m "feat: add Workflows nav item to sidebar Automation section"
```

---

## Task 8: Environment variables

**Files:**
- Modify: `apps/sales-app/.env.example` (create if absent) or the root `.env` equivalent

- [ ] **Step 1: Add n8n env vars to the example env file**

Check if a `.env.local` or `.env.example` exists in `apps/sales-app/`. If not, create `.env.local`:

```bash
# n8n integration
NEXT_PUBLIC_N8N_URL=http://localhost:5678
NEXT_PUBLIC_N8N_API_KEY=your-n8n-api-key-here
```

To get an n8n API key: start n8n → Settings → API → Create an API Key.

- [ ] **Step 2: Commit**

```bash
git add apps/sales-app/.env.local   # or .env.example
git commit -m "feat: add n8n env vars for workflows page"
```

---

## Task 9: Smoke test

- [ ] **Step 1: Start n8n (if not already running)**

```bash
docker run -d -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

Open `http://localhost:5678`, create an API key under Settings → n8n API, and paste it into `NEXT_PUBLIC_N8N_API_KEY`.

- [ ] **Step 2: Start the UI dev server**

```bash
cd "/Users/I769817/Hassan/Sales Automation/sales-automation-ui"
pnpm --filter sales-app dev
```

- [ ] **Step 3: Verify the full flow**

1. Open `http://localhost:3000` and log in
2. Sidebar should show "Automation → Workflows" at the bottom
3. Click "Workflows" — should navigate to `/workflows`
4. Workflow list loads (or shows "Cannot connect to n8n" if n8n is not running)
5. Toggle a workflow on/off — badge updates immediately
6. Click ▶ Run — button shows spinner then returns
7. Click ↗ — opens n8n canvas in a new tab
8. Click 🗑 — confirmation row appears; click Delete to remove
9. Filter tabs (All / Active / Inactive) filter the list correctly
10. "New Workflow" button opens `http://localhost:5678/workflow/new` in a new tab
