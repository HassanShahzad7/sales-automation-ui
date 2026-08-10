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

function SessionsSidebar() {
  const {
    sessions,
    currentSessionId,
    isLoadingSessions,
    removeSession,
    logout,
  } = useSalesRuntime();

  const runtime = useAssistantRuntime();

  const router = useRouter();
  const pathname = usePathname();

  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    await runtime.threads.switchToThread(sessionId);
  };

  const handleNewSession = async () => {
    await runtime.threads.switchToNewThread();
  };

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string,
    sessionToken: string,
  ) => {
    e.stopPropagation();
    await removeSession(sessionId, sessionToken);
    if (sessionId === currentSessionId) {
      await runtime.threads.switchToNewThread();
    }
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-sidebar-foreground">
          Sales Assistant
        </span>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOutIcon className="size-4" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={handleNewSession}
          className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 font-medium text-sm transition-colors hover:bg-sidebar-accent"
        >
          <PlusIcon className="size-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1">
        {isLoadingSessions ? (
          <div className="space-y-1 px-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-sidebar-accent"
              />
            ))}
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.session_id}
              type="button"
              onClick={() => handleSwitchSession(session.session_id)}
              className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                session.session_id === currentSessionId
                  ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}
            >
              <MessageSquareIcon className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {session.name || "New Chat"}
              </span>
              <button
                type="button"
                onClick={(e) =>
                  handleDeleteSession(
                    e,
                    session.session_id,
                    session.token.access_token,
                  )
                }
                title="Delete conversation"
                className="hidden rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:block"
              >
                <TrashIcon className="size-3" />
              </button>
            </button>
          ))
        )}
      </div>
      {/* Automation section */}
      <div className="border-sidebar-border border-t px-3 py-2">
        <p className="px-2 pb-1 font-semibold text-sidebar-foreground/40 text-xs uppercase tracking-wide">
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
    </aside>
  );
}

export function ChatUI() {
  return (
    <div className="flex h-dvh">
      <SessionsSidebar />
      <main className="min-w-0 flex-1">
        <Thread />
      </main>
    </div>
  );
}
