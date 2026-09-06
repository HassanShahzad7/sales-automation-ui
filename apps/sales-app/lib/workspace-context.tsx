"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Workspace = "actual" | "demo";

const KEY = "sales_app_workspace";

function readStoredWorkspace(): Workspace {
  if (typeof window === "undefined") return "actual";
  return localStorage.getItem(KEY) === "demo" ? "demo" : "actual";
}

type WorkspaceContextType = {
  workspace: Workspace;
  isDemo: boolean;
  setWorkspace: (workspace: Workspace) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType>(null!);
export const useWorkspace = () => useContext(WorkspaceContext);

// Global toggle between "actual" (real database/integration data) and "demo"
// (fictional sample data for product demos). Persisted so a reload doesn't
// silently drop back to real data mid-demo. Every page must read this
// instead of hitting the real API directly, so the two data sets never mix.
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace>("actual");

  useEffect(() => {
    setWorkspaceState(readStoredWorkspace());
  }, []);

  const setWorkspace = useCallback((next: Workspace) => {
    setWorkspaceState(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, next);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ workspace, isDemo: workspace === "demo", setWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
