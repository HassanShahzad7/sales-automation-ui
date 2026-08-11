"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AssistantRuntimeProvider,
  type ThreadMessage,
} from "@assistant-ui/react";
import { HttpAgent } from "@ag-ui/client";
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui";
import * as api from "./api";
import { clearAuth, getAuth, updateSessionToken } from "./auth";

type Session = api.SessionData;

type SalesRuntimeContextType = {
  userToken: string | null;
  sessions: Session[];
  currentSessionId: string | null;
  isLoadingSessions: boolean;
  createNewSession: () => Promise<string>;
  removeSession: (sessionId: string, sessionToken: string) => Promise<void>;
  logout: () => void;
};

const SalesRuntimeContext = createContext<SalesRuntimeContextType>(null!);
export const useSalesRuntime = () => useContext(SalesRuntimeContext);

function toThreadMessages(
  backendMessages: api.BackendMessage[],
): ThreadMessage[] {
  return backendMessages.map((msg, i) => {
    if (msg.role === "user") {
      return {
        id: `hist-${i}`,
        role: "user" as const,
        createdAt: new Date(),
        content: [{ type: "text" as const, text: msg.content }],
        attachments: [],
        metadata: { custom: {} },
      };
    }
    return {
      id: `hist-${i}`,
      role: "assistant" as const,
      createdAt: new Date(),
      content: [{ type: "text" as const, text: msg.content }],
      status: { type: "complete" as const, reason: "stop" as const },
      metadata: {
        unstable_state: null,
        unstable_annotations: [],
        unstable_data: [],
        steps: [],
        custom: {},
      },
    };
  });
}

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

  const [authState] = useState(() => getAuth());
  const userToken = authState?.userToken ?? null;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const currentSessionToken = useMemo(() => {
    if (!currentSessionId) return authState?.sessionToken ?? null;
    const found = sessions.find((s) => s.session_id === currentSessionId);
    return found?.token.access_token ?? authState?.sessionToken ?? null;
  }, [currentSessionId, sessions, authState?.sessionToken]);

  useEffect(() => {
    if (!userToken) return;
    setIsLoadingSessions(true);
    api
      .getSessions(userToken)
      .then((sess) => setSessions(sess))
      .catch(console.error)
      .finally(() => setIsLoadingSessions(false));
  }, [userToken]);

  const createNewSession = useCallback(async (): Promise<string> => {
    if (!userToken) throw new Error("Not authenticated");
    const newSession = await api.createSession(userToken);
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.session_id);
    updateSessionToken(newSession.session_id, newSession.token.access_token);
    return newSession.session_id;
  }, [userToken]);

  const removeSession = useCallback(
    async (sessionId: string, sessionToken: string) => {
      await api.deleteSessionById(sessionToken, sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    window.location.href = "/login";
  }, []);

  const agent = useMemo(
    () =>
      new HttpAgent({
        url: `${API_URL}/api/v1/chatbot/chat/stream`,
        ...(currentSessionId ? { threadId: currentSessionId } : {}),
        headers: {
          Accept: "text/event-stream",
          ...(currentSessionToken
            ? { Authorization: `Bearer ${currentSessionToken}` }
            : {}),
        },
      }),
    [API_URL, currentSessionId, currentSessionToken],
  );

  const threadListAdapter = useMemo(
    () => ({
      threadId: currentSessionId ?? undefined,

      onSwitchToNewThread: async () => {
        await createNewSession();
      },

      onSwitchToThread: async (threadId: string) => {
        const session = sessionsRef.current.find(
          (s) => s.session_id === threadId,
        );
        const token = session?.token.access_token;
        if (!token) throw new Error(`Session ${threadId} not found`);

        setCurrentSessionId(threadId);
        updateSessionToken(threadId, token);

        try {
          const history = await api.getChatHistory(token);
          return { messages: toThreadMessages(history) };
        } catch {
          return { messages: [] as ThreadMessage[] };
        }
      },
    }),
    [currentSessionId, createNewSession],
  );

  const runtime = useAgUiRuntime({
    agent,
    logger: {
      debug: (...a: unknown[]) => console.debug("[agui]", ...a),
      error: (...a: unknown[]) => console.error("[agui]", ...a),
    },
    adapters: { threadList: threadListAdapter },
  });

  const contextValue = useMemo<SalesRuntimeContextType>(
    () => ({
      userToken,
      sessions,
      currentSessionId,
      isLoadingSessions,
      createNewSession,
      removeSession,
      logout,
    }),
    [
      userToken,
      sessions,
      currentSessionId,
      isLoadingSessions,
      createNewSession,
      removeSession,
      logout,
    ],
  );

  return (
    <SalesRuntimeContext.Provider value={contextValue}>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </SalesRuntimeContext.Provider>
  );
}
