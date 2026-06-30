"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export interface ParentChild {
  id: string;
  name: string;
  age: number;
  language: string;
}

export interface ParentSettings {
  screenTimeMinutes: number;
  contentLevel: string;
  subscriptionPlan: string;
  subscriptionActive: boolean;
}

export interface ParentUser {
  id: string;
  email: string;
  name: string | null;
  hasPin: boolean;
  pinVerified: boolean;
  children: ParentChild[];
  settings: ParentSettings | null;
}

interface ParentContextValue {
  user: ParentUser | null;
  loading: boolean;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const ParentContext = createContext<ParentContextValue | null>(null);

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ParentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      setUser(json.data);
      setSelectedChildId((prev) => {
        if (prev) return prev;
        return json.data.children?.[0]?.id ?? null;
      });
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const isAuthPage = ["/login", "/register"].includes(path);
      if (json.data.hasPin && !json.data.pinVerified && !isAuthPage && path !== "/pin") {
        router.push("/pin");
      }
    } catch {
      setUser(null);
    }
  }, [router]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      selectedChildId,
      setSelectedChildId,
      refresh,
      logout,
    }),
    [user, loading, selectedChildId, refresh, logout]
  );

  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>;
}

export function useParentSession() {
  const ctx = useContext(ParentContext);
  if (!ctx) throw new Error("useParentSession ParentProvider ichida ishlatilishi kerak");
  return ctx;
}
