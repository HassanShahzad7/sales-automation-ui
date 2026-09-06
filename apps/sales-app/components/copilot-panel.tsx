"use client";

import { useAssistantRuntime } from "@assistant-ui/react";
import { PlusIcon, XIcon } from "lucide-react";
import { MessageSquareIcon, TrashIcon } from "lucide-react";
import { Thread } from "@/components/assistant-ui/thread";
import { Button } from "@/components/ui/button";
import { useSalesRuntime } from "@/lib/runtime-provider";

// The chat/session-history experience that used to be the whole app (see
// old chat-ui.tsx SessionsSidebar) is now a floating window that overlays
// the page instead of docking as a full-height column, so its size stays
// fixed regardless of viewport height and it never affects page layout.
export function CopilotPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { sessions, currentSessionId, isLoadingSessions, removeSession } =
    useSalesRuntime();
  const runtime = useAssistantRuntime();

  if (!open) return null;

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
    // removeSession silently succeeds even if the session is already gone on the backend
    await removeSession(sessionId, sessionToken).catch(() => {});
    if (sessionId === currentSessionId) {
      await runtime.threads.switchToNewThread();
    }
  };

  return (
    <aside className="fixed right-6 bottom-6 z-50 flex h-[min(640px,calc(100dvh-3rem))] w-96 flex-col overflow-hidden rounded-xl border bg-sidebar shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-sidebar-border border-b px-4 py-3">
        <span className="font-semibold text-sidebar-foreground">
          AI Copilot
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close copilot"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleNewSession}
        >
          <PlusIcon className="size-4" />
          New Chat
        </Button>
      </div>

      <div className="max-h-48 shrink-0 overflow-y-auto px-2 py-1">
        <p className="px-3 pt-0.5 pb-1 font-semibold text-sidebar-foreground/40 text-xs uppercase tracking-wide">
          Chats
        </p>
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
            // biome-ignore lint/a11y/useSemanticElements: delete button nested inside prevents using <button> here
            <div
              key={session.session_id}
              role="button"
              tabIndex={0}
              onClick={() => handleSwitchSession(session.session_id)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSwitchSession(session.session_id)
              }
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
            </div>
          ))
        )}
      </div>

      <div className="min-h-0 flex-1 border-sidebar-border border-t">
        <Thread />
      </div>
    </aside>
  );
}
