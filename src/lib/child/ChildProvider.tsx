"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import type { ChildLanguage, ChildProfile, ChildProgress } from "@/types/childUI";
import { fetchChildProfile } from "@/lib/child/childData";
import { useChildMock } from "@/lib/config/dataMode";

const PROFILE_KEY = "nihol_child_profile";
const PROGRESS_KEY = "nihol_child_progress";

const DEFAULT_PROFILE: ChildProfile = {
  childId: "",
  name: "Bola",
  age: 10,
  language: "uz",
};

const DEFAULT_PROGRESS: ChildProgress = {
  stars: 0,
  level: 1,
  lastMoodDate: null,
  lastMoodEmoji: null,
  dailyTaskDate: null,
  dailyTaskDone: false,
};

interface ChildContextValue {
  profile: ChildProfile;
  progress: ChildProgress;
  ready: boolean;
  profileError: string | null;
  setLanguage: (lang: ChildLanguage) => void;
  addStars: (count?: number) => void;
  markMoodDone: (emoji: string) => void;
  markDailyTaskDone: () => void;
  hasMoodToday: boolean;
  hasDailyTaskToday: boolean;
  reloadProfile: () => Promise<void>;
}

const ChildContext = createContext<ChildContextValue | null>(null);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function levelFromStars(stars: number): number {
  return Math.floor(stars / 10) + 1;
}

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [progress, setProgress] = useState<ChildProgress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const reloadProfile = useCallback(async () => {
    const urlChildId = searchParams.get("childId")?.trim();
    const stored = loadJson<ChildProfile>(PROFILE_KEY, DEFAULT_PROFILE);
    const childId =
      urlChildId ||
      stored.childId ||
      process.env.NEXT_PUBLIC_DEMO_CHILD_ID?.trim() ||
      "";

    if (useChildMock()) {
      setProfile({ ...stored, childId: stored.childId || "child-demo-001", name: stored.name || "Jasur" });
      setProfileError(null);
      setReady(true);
      return;
    }

    if (!childId) {
      setProfileError(
        "Bola profili tanlanmagan. Ota-ona panelidagi «Bola rejimi» tugmasi orqali kiriting."
      );
      setReady(true);
      return;
    }

    const apiProfile = await fetchChildProfile(childId);
    if (!apiProfile) {
      setProfileError(
        childId
          ? "Bola profili topilmadi. Ota-ona panelidan bolani tanlang yoki ?childId= parametrini tekshiring."
          : "Bola profili tanlanmagan. Ota-ona panelidagi «Bola rejimi» tugmasi orqali kiriting."
      );
      setReady(true);
      return;
    }

    const next: ChildProfile = {
      childId: apiProfile.childId,
      name: apiProfile.name,
      age: apiProfile.age,
      language: apiProfile.language,
    };
    setProfile(next);
    setProfileError(null);
    setReady(true);
  }, [searchParams]);

  useEffect(() => {
    setProfile(loadJson(PROFILE_KEY, DEFAULT_PROFILE));
    setProgress(loadJson(PROGRESS_KEY, DEFAULT_PROGRESS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void reloadProfile();
  }, [hydrated, reloadProfile]);

  useEffect(() => {
    if (!hydrated || !profile.childId) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress, hydrated]);

  const setLanguage = useCallback((lang: ChildLanguage) => {
    setProfile((p) => ({ ...p, language: lang }));
  }, []);

  const addStars = useCallback((count = 1) => {
    setProgress((prev) => {
      const stars = prev.stars + count;
      return { ...prev, stars, level: levelFromStars(stars) };
    });
  }, []);

  const markMoodDone = useCallback((emoji: string) => {
    setProgress((prev) => ({
      ...prev,
      lastMoodDate: todayKey(),
      lastMoodEmoji: emoji,
    }));
  }, []);

  const markDailyTaskDone = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      dailyTaskDate: todayKey(),
      dailyTaskDone: true,
    }));
  }, []);

  const hasMoodToday = progress.lastMoodDate === todayKey();
  const hasDailyTaskToday =
    progress.dailyTaskDate === todayKey() && progress.dailyTaskDone;

  const value = useMemo(
    () => ({
      profile,
      progress,
      ready,
      profileError,
      setLanguage,
      addStars,
      markMoodDone,
      markDailyTaskDone,
      hasMoodToday,
      hasDailyTaskToday,
      reloadProfile,
    }),
    [
      profile,
      progress,
      ready,
      profileError,
      setLanguage,
      addStars,
      markMoodDone,
      markDailyTaskDone,
      hasMoodToday,
      hasDailyTaskToday,
      reloadProfile,
    ]
  );

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-2xl animate-pulse">⭐</div>
      </div>
    );
  }

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChildSession() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error("useChildSession ChildProvider ichida ishlatilishi kerak");
  return ctx;
}
