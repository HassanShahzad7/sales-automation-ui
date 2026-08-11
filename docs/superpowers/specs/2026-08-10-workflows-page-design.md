# Workflows Page — Design Spec

**Date:** 2026-08-10
**Status:** Approved

## Summary

Add a "Workflows" page to the Sales Assistant UI that lets users monitor and operate their n8n automation workflows without leaving the app. Day-to-day operations (enable/disable, trigger, view status) happen natively inside the UI. Building or editing a workflow opens n8n in a new tab.

---

## Architecture

### How it connects

The new Workflows page is a **pure frontend addition** — no backend changes required. The UI calls n8n's REST API directly from the browser:

- **n8n REST API base URL:** `http://localhost:5678/api/v1` (configurable via `NEXT_PUBLIC_N8N_URL` env var)
- **Authentication:** n8n API key stored in `NEXT_PUBLIC_N8N_API_KEY` env var
- **New Workflow / Edit buttons:** open `NEXT_PUBLIC_N8N_URL` (the n8n UI) in a new browser tab

No changes to `sales-automation-agent` backend. The n8n API key is only used client-side for this management UI.

---

## Navigation

The existing `SessionsSidebar` component in [chat-ui.tsx](../../apps/sales-app/components/chat-ui.tsx) is extended with an "Automation" section below the chat session list, separated by a divider.

```
[Sales Assistant]          ← header
[+ New Chat]
─── Chats ───
  Email campaign Q3
  Follow-up sequence
  ...
─── Automation ───         ← new section
  ⬛ Workflows             ← new nav item
```

Clicking "Workflows" navigates to `/workflows` (Next.js app route). Navigating back to `/` returns to the chat view.

---

## Workflows Page (`/workflows`)

### Page header
- Title: "Workflows"
- Subtitle: "Manage your n8n automation workflows"
- "New Workflow" button — opens `{N8N_URL}/workflow/new` in a new tab

### Filter tabs
Three tabs filter the workflow list: **All**, **Active**, **Inactive**. Counts shown in parentheses. Client-side filter on already-fetched data (no extra API calls).

### Workflow table

Each row contains:

| Column | Content |
|---|---|
| Workflow | Name of the workflow |
| Status | Active (green) / Inactive (grey) badge |
| Last Run | Human-readable relative time (e.g. "2 min ago") |
| Result | Success (green) / Failed (red) / Never run (grey) |
| Actions | Toggle, Run, Open in n8n, Delete |

**Actions:**
- **Toggle** — enable/disable via `POST /workflows/{id}/activate` or `POST /workflows/{id}/deactivate`. Optimistic UI update.
- **Run ▶** — trigger manual execution via `POST /workflows/{id}/run`. Button shows spinner while pending.
- **Open in n8n ↗** — opens `{N8N_URL}/workflow/{id}` in a new tab.
- **Delete 🗑** — shows a confirmation dialog, then calls `DELETE /workflows/{id}`.

---

## Data Fetching

### n8n API endpoints used

| Action | Method | Endpoint |
|---|---|---|
| List workflows | GET | `/api/v1/workflows` |
| Activate workflow | POST | `/api/v1/workflows/{id}/activate` |
| Deactivate workflow | POST | `/api/v1/workflows/{id}/deactivate` |
| Execute workflow | POST | `/api/v1/workflows/{id}/run` |
| Delete workflow | DELETE | `/api/v1/workflows/{id}` |
| Get executions | GET | `/api/v1/executions?workflowId={id}&limit=1` |

Fetching is done with plain `fetch` — no additional libraries. The workflows list is fetched on page load. Execution status (last run time + result) is fetched alongside the workflow list by hitting the executions endpoint for each workflow, or a single call with `includeData=false` if n8n supports bulk.

### Error states
- n8n unreachable → banner: "Cannot connect to n8n at {url}. Make sure n8n is running."
- API key invalid → banner: "n8n API key is invalid. Check NEXT_PUBLIC_N8N_API_KEY."
- Individual action fails → inline toast notification.

---

## New Files

```
apps/sales-app/
  app/
    workflows/
      page.tsx           ← /workflows route
  components/
    workflows/
      workflows-page.tsx ← main page component
      workflow-table.tsx ← table + rows
      workflow-row.tsx   ← single row with actions
      workflow-filters.tsx ← All / Active / Inactive tabs
  lib/
    n8n.ts               ← n8n API client (fetch wrapper + types)
```

## Modified Files

```
apps/sales-app/
  components/
    chat-ui.tsx          ← add "Automation" section + Workflows nav item to sidebar
  .env.example (or next env) ← add NEXT_PUBLIC_N8N_URL, NEXT_PUBLIC_N8N_API_KEY
```

---

## Environment Variables

```bash
# n8n connection (client-side)
NEXT_PUBLIC_N8N_URL=http://localhost:5678
NEXT_PUBLIC_N8N_API_KEY=your-n8n-api-key
```

---

## Out of Scope

- Workflow canvas / node editor (use n8n directly)
- Creating workflows from inside the UI (opens n8n new tab)
- Execution log detail view (opens n8n execution page)
- n8n credential management
- Multi-user access control on workflows
