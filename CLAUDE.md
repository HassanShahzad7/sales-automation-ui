# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From repo root
pnpm install          # install all workspace dependencies
pnpm build            # turbo build (all packages, respects dependency order)
pnpm lint             # biome check (all files)
pnpm lint:fix         # biome check --fix
pnpm test             # turbo test (vitest across packages)

# Scoped to one package/app
pnpm --filter=sales-app dev          # Next.js dev server for the sales UI
pnpm --filter=sales-app build
pnpm --filter=@assistant-ui/react test
pnpm --filter=@assistant-ui/react test:watch

# Changesets (published packages only)
pnpm changeset        # create a changeset before opening a PR
pnpm ci:version       # bump versions (CI)
pnpm ci:publish       # build + publish (CI)
```

Node ≥ 24 and pnpm 10.33.0 are required (see `package.json` `engines`).

## Repository Structure

This is a **Turborepo monorepo** for the `assistant-ui` React library, with a custom `sales-app` Next.js application layered on top.

```
packages/
  tap/              ← zero-dep reactive primitives (tapState, tapEffect, tapMemo, etc.)
  store/            ← bridges tap with React (useAui, useAuiState, AuiProvider)
  core/             ← shared primitives and types; has a ./react sub-path
  react/            ← primary web distribution (re-exports core + Radix primitives)
  react-native/     ← RN distribution (re-exports core + RN primitives)
  react-ink/        ← terminal/Ink distribution
  react-ag-ui/      ← AG-UI protocol adapter (used by the sales app)
  react-langgraph/  ← LangGraph adapter
  react-ai-sdk/     ← Vercel AI SDK adapter
  ui/               ← shadcn-style components (copied into user projects)
  assistant-stream/ ← streaming protocol implementation
  ...

apps/
  sales-app/        ← Next.js 16 sales assistant UI (the end-user application)
  docs/             ← documentation site
  devtools-extension/ devtools-frame/  ← browser devtools
```

## Package Boundaries

Customers install `@assistant-ui/react`, `@assistant-ui/react-native`, or `@assistant-ui/react-ink` — never `@assistant-ui/core` directly. The `./react` sub-path of `core` is what distribution packages re-export. Changes to `core` affect all three distributions.

`@assistant-ui/ui` contains shadcn-style components that are **copied into user projects** (not installed as a dep). They are used directly in this monorepo to avoid duplication.

There is an ongoing migration from a legacy runtime architecture to the **tap-only architecture**. New code should use `tap*` primitives (`tapState`, `tapEffect`, `tapMemo`, `tapCallback`, `tapConst`, `tapResources`). `tapEffectEvent` returns a stable value and is exempt from exhaustive dependency tracking.

## Sales App (`apps/sales-app`)

A Next.js 16 application that is the primary end-user interface for the sales automation platform.

### Architecture
```
apps/sales-app/
  app/
    page.tsx          ← auth guard → RuntimeProvider + ChatUI
    login/page.tsx    ← login / register form
    workflows/page.tsx ← n8n workflow management view
  components/
    chat-ui.tsx       ← SessionsSidebar + Thread layout
  lib/
    runtime-provider.tsx  ← AG-UI HttpAgent, thread list adapter, SalesRuntimeContext
    api.ts                ← typed fetch wrappers for all agent REST endpoints
    auth.ts               ← localStorage-backed auth state (userToken + sessionToken)
    n8n.ts                ← n8n API client
```

### Runtime wiring
`RuntimeProvider` creates an `HttpAgent` (from `@ag-ui/client`) pointed at `POST /api/v1/chatbot/chat/stream`. It wraps this in `useAgUiRuntime` (from `@assistant-ui/react-ag-ui`) and provides the result to `AssistantRuntimeProvider`. The `threadListAdapter` handles switching between sessions by fetching history from `/api/v1/chatbot/messages`.

### Auth model
Two tokens are stored in `localStorage`:
- **userToken** — obtained from `/api/v1/auth/login`; used for session management calls
- **sessionToken** — per-session JWT from `/api/v1/auth/session`; sent as `Authorization: Bearer` on chat requests

`NEXT_PUBLIC_API_URL` (default `http://localhost:8001`) points to the agent backend.

### Environment
Copy `.env.example` to `.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:8000   # agent backend
NEXT_PUBLIC_N8N_URL=http://localhost:5678   # n8n instance
NEXT_PUBLIC_N8N_API_KEY=<your-key>
```

## Code Style

Linting and formatting are handled entirely by **Biome** (`biome.json`):
- 2-space indentation, 80-char line width, LF line endings
- Double quotes for JS/JSX
- Trailing commas everywhere
- Tailwind class sorting enforced via `useSortedClasses` (use `cn`, `clsx`, `cva`, `twMerge`)
- `useExhaustiveDependencies` is enforced for all `tap*` hooks (same semantics as React hooks)

Run `pnpm lint:fix` before committing — husky + lint-staged runs Biome on every commit.

## Changesets

Every PR that modifies a **published** package needs a changeset. Always use **patch** — minor/major require maintainer approval.

```md
---
"@assistant-ui/react": patch
---

feat: description of the change
```

Private packages (`apps/docs`, `apps/sales-app`, `packages/x-buildutils`, etc.) are exempt.

## Build System

Turborepo orchestrates builds. `aui-build` (from `@assistant-ui/x-buildutils`) is the per-package build tool. The `build` task depends on `^build` (dependencies built first). Tests depend on `^build`.

## Testing Requirement

**After any change, verify it works before considering the task done.** For package changes, run the relevant `vitest` suite. For `sales-app` changes, start the Next.js dev server (`pnpm --filter=sales-app dev`), open the browser, and test the affected flow end-to-end — streaming, auth, session switching, and tool call rendering are the critical paths. Do not rely on lint success alone.
