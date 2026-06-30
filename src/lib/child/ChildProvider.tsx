"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ChildLanguage, ChildProfile, ChildProgress } from "@/types/childUI";

const PROFILE_KEY = "safarai_child_profile";
const PROGRESS_KEY = "safarai_child_progress";

const DEFAULT_PROFILE: ChildProfile = {
  childId: "child-demo-001",
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
  setLanguage: (lang: ChildLanguage) => void;
  addStars: (count?: number) => void;
  markMoodDone: (emoji: string) => void;
  markDailyTaskDone: () => void;
  hasMoodToday: boolean;
  hasDailyTaskToday: boolean;
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
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [progress, setProgress] = useState<ChildProgress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadJson(PROFILE_KEY, DEFAULT_PROFILE));
    setProgress(loadJson(PROGRESS_KEY, DEFAULT_PROGRESS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
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
    const today = todayKey();
    setProgress((prev) => ({
      ...prev,
      lastMoodDate: today,
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
      setLanguage,
      addStars,
      markMoodDone,
      markDailyTaskDone,
      hasMoodToday,
      hasDailyTaskToday,
    }),
    [
      profile,
      progress,
      setLanguage,
      addStars,
      markMoodDone,
      markDailyTaskDone,
      hasMoodToday,
      hasDailyTaskToday,
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
