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

export type Icp = {
  id: string;
  name: string;
  description: string | null;
};

export async function getIcps(sessionToken: string): Promise<Icp[]> {
  const res = await fetch(`${API_URL()}/api/v1/apollo/icps`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!res.ok) throw new Error("Failed to load ICPs");
  const data = (await res.json()) as { icps: Icp[] };
  return data.icps;
}

export type IcpCompany = {
  id: string;
  name: string | null;
  domain: string | null;
};

export async function getIcpCompanies(
  sessionToken: string,
  icpId: string,
): Promise<IcpCompany[]> {
  const res = await fetch(
    `${API_URL()}/api/v1/apollo/icps/${icpId}/companies`,
    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    },
  );
  if (!res.ok) throw new Error("Failed to load companies for this ICP");
  const data = (await res.json()) as { companies: IcpCompany[] };
  return data.companies;
}

export type IcpProspect = {
  id: string;
  name: string | null;
  title: string | null;
  company_name: string | null;
  email: string | null;
  linkedin_url: string | null;
};

export async function getIcpProspects(
  sessionToken: string,
  icpId: string,
): Promise<IcpProspect[]> {
  const res = await fetch(
    `${API_URL()}/api/v1/apollo/icps/${icpId}/prospects`,
    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    },
  );
  if (!res.ok) throw new Error("Failed to load prospects for this ICP");
  const data = (await res.json()) as { prospects: IcpProspect[] };
  return data.prospects;
}

export type Company = {
  id: string;
  name: string | null;
  domain: string | null;
  linkedin_url: string | null;
  employee_range: string | null;
  revenue_range: string | null;
  founded_year: number | null;
  icp_names: string[];
  prospects_count: number;
  created_at: string;
};

export async function getCompanies(sessionToken: string): Promise<Company[]> {
  const res = await fetch(`${API_URL()}/api/v1/apollo/companies`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!res.ok) throw new Error("Failed to load companies");
  const data = (await res.json()) as { companies: Company[] };
  return data.companies;
}

export type OutreachSummary = {
  maturity: string;
  last_contact_date: string | null;
  next_followup_date: string | null;
};

export type Prospect = {
  id: string;
  name: string | null;
  title: string | null;
  seniority: string | null;
  company_name: string | null;
  email: string | null;
  email_status: string | null;
  linkedin_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  icp_names: string[];
  email_outreach: OutreachSummary | null;
  linkedin_outreach: OutreachSummary | null;
  created_at: string;
  updated_at: string;
};

export async function getProspects(sessionToken: string): Promise<Prospect[]> {
  const res = await fetch(`${API_URL()}/api/v1/apollo/prospects`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!res.ok) throw new Error("Failed to load prospects");
  const data = (await res.json()) as { prospects: Prospect[] };
  return data.prospects;
}

export type OutreachDetail = OutreachSummary & {
  reached_out_at: string | null;
  responded_at: string | null;
  interactions: {
    timestamp: string;
    direction: "outbound" | "inbound";
    content: string;
  }[];
};

export type ProspectDetail = {
  id: string;
  name: string | null;
  title: string | null;
  seniority: string | null;
  email: string | null;
  email_status: string | null;
  direct_phone: string | null;
  linkedin_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  company_name: string | null;
  company_domain: string | null;
  company_linkedin_url: string | null;
  email_outreach: OutreachDetail | null;
  linkedin_outreach: OutreachDetail | null;
};

export async function getProspectDetail(
  sessionToken: string,
  prospectId: string,
): Promise<ProspectDetail> {
  const res = await fetch(
    `${API_URL()}/api/v1/apollo/prospects/${prospectId}`,
    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    },
  );
  if (!res.ok) throw new Error("Failed to load prospect");
  return res.json();
}

export type CreateIcpPayload = {
  name: string;
  description?: string;
  company_filters: Record<string, unknown>;
  people_filters: Record<string, unknown>;
};

export type CreateIcpResult = {
  success: boolean;
  icp_id: string;
  name: string;
  estimated_company_matches?: number;
  warning?: string;
};

export async function createIcp(
  sessionToken: string,
  payload: CreateIcpPayload,
): Promise<CreateIcpResult> {
  const res = await fetch(`${API_URL()}/api/v1/apollo/icps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? "Failed to create ICP");
  }
  return res.json();
}
