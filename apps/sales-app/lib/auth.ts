type AuthData = {
  userToken: string;
  sessionId: string;
  sessionToken: string;
};

const KEY = "sales_app_auth";

export function saveAuth(data: AuthData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthData) : null;
  } catch {
    return null;
  }
}

export function updateSessionToken(
  sessionId: string,
  sessionToken: string,
): void {
  const auth = getAuth();
  if (!auth) return;
  saveAuth({ ...auth, sessionId, sessionToken });
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
