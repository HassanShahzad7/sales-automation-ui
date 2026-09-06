"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { DEMO_COMPANIES } from "@/lib/demo-companies";
import { DEMO_ICPS } from "@/lib/demo-icps";
import { DEMO_PROSPECT_DETAILS, DEMO_PROSPECTS } from "@/lib/demo-prospects";
import { useSalesRuntime } from "@/lib/runtime-provider";
import { useWorkspace } from "@/lib/workspace-context";

// Workspace-aware data hooks. Every page reads through one of these instead
// of calling lib/api.ts directly, so real API calls never fire while the
// Demo Workspace is active (and vice versa) — the two data sets stay
// completely separated at the fetch boundary rather than by filtering
// results after the fact.

export function useIcps() {
  const { isDemo } = useWorkspace();
  const { currentSessionToken } = useSalesRuntime();
  const [icps, setIcps] = useState<api.Icp[] | null>(null);

  const refetch = useCallback(() => {
    if (isDemo) {
      setIcps(DEMO_ICPS);
      return;
    }
    if (!currentSessionToken) return;
    api
      .getIcps(currentSessionToken)
      .then(setIcps)
      .catch(() => setIcps([]));
  }, [isDemo, currentSessionToken]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { icps, refetch };
}

export function useCompanies() {
  const { isDemo } = useWorkspace();
  const { currentSessionToken } = useSalesRuntime();
  const [companies, setCompanies] = useState<api.Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setCompanies(DEMO_COMPANIES);
      setIsLoading(false);
      setError(null);
      return;
    }
    if (!currentSessionToken) return;
    setIsLoading(true);
    api
      .getCompanies(currentSessionToken)
      .then(setCompanies)
      .catch(() => setError("Failed to load companies"))
      .finally(() => setIsLoading(false));
  }, [isDemo, currentSessionToken]);

  return { companies, isLoading, error };
}

export function useProspects() {
  const { isDemo } = useWorkspace();
  const { currentSessionToken } = useSalesRuntime();
  const [prospects, setProspects] = useState<api.Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setProspects(DEMO_PROSPECTS);
      setIsLoading(false);
      setError(null);
      return;
    }
    if (!currentSessionToken) return;
    setIsLoading(true);
    api
      .getProspects(currentSessionToken)
      .then(setProspects)
      .catch(() => setError("Failed to load prospects"))
      .finally(() => setIsLoading(false));
  }, [isDemo, currentSessionToken]);

  return { prospects, isLoading, error };
}

export function useProspectDetail(prospectId: string | null) {
  const { isDemo } = useWorkspace();
  const { currentSessionToken } = useSalesRuntime();
  const [detail, setDetail] = useState<api.ProspectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!prospectId) {
      setDetail(null);
      return;
    }
    if (isDemo) {
      setDetail(DEMO_PROSPECT_DETAILS[prospectId] ?? null);
      return;
    }
    if (!currentSessionToken) return;
    setIsLoading(true);
    api
      .getProspectDetail(currentSessionToken, prospectId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setIsLoading(false));
  }, [prospectId, isDemo, currentSessionToken]);

  return { detail, isLoading };
}
