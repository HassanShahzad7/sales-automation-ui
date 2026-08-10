const N8N_URL = () =>
  process.env.NEXT_PUBLIC_N8N_URL ?? "http://localhost:5678";

const N8N_API_KEY = () => process.env.NEXT_PUBLIC_N8N_API_KEY ?? "";

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
  const params = new URLSearchParams({
    workflowId,
    limit: "1",
    includeData: "false",
  });
  const data = await n8nFetch<N8nListResponse<N8nExecution>>(
    `/executions?${params}`,
  );
  return data.data[0] ?? null;
}

export function n8nWorkflowUrl(id: string): string {
  return `${N8N_URL()}/workflow/${id}`;
}

export function n8nNewWorkflowUrl(): string {
  return `${N8N_URL()}/workflow/new`;
}
