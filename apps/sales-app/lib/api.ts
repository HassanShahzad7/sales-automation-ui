const API_URL = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export type BackendMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type TokenData = {
  access_token: string;
  token_type: string;
  expires_at: string;
};

export type SessionData = {
  session_id: string;
  name: string;
  token: TokenData;
};

export async function register(
  email: string,
  password: string,
  username?: string,
): Promise<{
  id: number;
  email: string;
  username: string | null;
  token: TokenData;
}> {
  const res = await fetch(`${API_URL()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? "Registration failed");
  }
  return res.json();
}

export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string }> {
  const body = new URLSearchParams({ email, password, grant_type: "password" });
  const res = await fetch(`${API_URL()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? "Invalid email or password");
  }
  return res.json();
}

export async function createSession(userToken: string): Promise<SessionData> {
  const res = await fetch(`${API_URL()}/api/v1/auth/session`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getSessions(userToken: string): Promise<SessionData[]> {
  const res = await fetch(`${API_URL()}/api/v1/auth/sessions`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    throw new AuthError("Failed to load sessions");
  }
  if (!res.ok) throw new Error("Failed to load sessions");
  return res.json();
}

export async function deleteSessionById(
  sessionToken: string,
  sessionId: string,
): Promise<void> {
  const res = await fetch(`${API_URL()}/api/v1/auth/session/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  // 404 means the session is already gone — treat as success
  if (res.status === 404) return;
  if (!res.ok) throw new Error("Failed to delete session");
}

export type AgentType = "chatbot" | "email" | "calendar";

export async function getChatHistory(
  sessionToken: string,
): Promise<BackendMessage[]> {
  return getAgentChatHistory(sessionToken, "chatbot");
}

export async function getAgentChatHistory(
  sessionToken: string,
  agentType: AgentType,
): Promise<BackendMessage[]> {
  const res = await fetch(`${API_URL()}/api/v1/${agentType}/messages`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!res.ok) throw new Error("Failed to load chat history");
  const data = (await res.json()) as { messages: BackendMessage[] };
  return data.messages;
}
