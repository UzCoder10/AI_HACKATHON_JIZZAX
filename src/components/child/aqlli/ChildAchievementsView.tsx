"use client";

import { useCallback, useEffect, useState } from "react";
import { MASCOT_URL } from "@/lib/child/brand";
import { getBadges, getChildProgress } from "@/lib/child/childData";
import type { ChildBadge, ChildProgressData } from "@/lib/child/aqlliTypes";
import { useChildSession } from "@/lib/child/ChildProvider";
import { ApiError } from "@/lib/api/fetchJson";
import { AqlliShell } from "./AqlliShell";
import { AqlliIcon } from "./AqlliIcon";
import { ChildEmpty, ChildError, ChildLoading } from "./ChildDataState";
import { useReducedMotion } from "./useReducedMotion";

export function ChildAchievementsView() {
  const reduced = useReducedMotion();
  const { profile, ready, profileError, reloadProfile } = useChildSession();
  const [progress, setProgress] = useState<ChildProgressData | null>(null);
  const [badges, setBadges] = useState<ChildBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ready) return;
    if (profileError) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, b] = await Promise.all([
        getChildProgress(profile.childId || undefined),
        getBadges(profile.childId || undefined),
      ]);
      setProgress(p);
      setBadges(b);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ma'lumot yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, [profile.childId, ready, profileError]);

  useEffect(() => {
    void load();
  }, [load]);

  const xpPct = progress
    ? Math.round((progress.xpCurrentLevel / progress.xpToNextLevel) * 100)
    : 0;

  if (!ready || loading) {
    return (
      <AqlliShell>
        <ChildLoading />
      </AqlliShell>
    );
  }

  if (profileError) {
    return (
      <AqlliShell>
        <ChildError message={profileError} onRetry={() => void reloadProfile()} />
      </AqlliShell>
    );
  }

  if (error) {
    return (
      <AqlliShell>
        <ChildError message={error} onRetry={() => void load()} />
      </AqlliShell>
    );
  }

  return (
    <AqlliShell>
      <header className="sticky top-0 z-40 bg-[#fdf9e9] px-5 pb-2 pt-4">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#705d00] shadow-sm">
              {progress?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={progress.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <span className="text-2xl font-bold text-[#705d00]">{progress?.name ?? profile.name}</span>
              <span className="mt-0.5 block w-fit rounded-full bg-[#d6e3ff] px-3 py-0.5 text-sm font-bold text-[#005db8]">
                {progress?.level ?? 1}-daraja
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#ece8d9] px-4 py-2 shadow-sm">
            <span className={reduced ? "text-xl" : "text-xl aqlli-pulse-ring"}>🔥</span>
            <span className="text-sm font-bold text-[#4d4633]">{progress?.streakDays ?? 0} kun</span>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-8 px-5 pb-32 pt-6 max-w-screen-xl w-full">
        <section className="relative overflow-hidden rounded-3xl border border-[#ffd93d]/30 bg-gradient-to-r from-[#ffd93d]/30 to-[#ffd93d]/10 p-8 text-center shadow-lg">
          <div className={`mx-auto mb-4 h-40 w-40 ${reduced ? "" : "aqlli-float"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MASCOT_URL} alt="" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#705d00] md:text-[28px]">
            Barakalla, {progress?.name ?? profile.name}!
          </h1>
        </section>

        <section>
          <div className="mb-2 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Keyingi daraja</h2>
            <span className="text-sm font-bold text-[#705d00]">
              {progress?.xpCurrentLevel ?? 0} / {progress?.xpToNextLevel ?? 600} XP
            </span>
          </div>
          <div className="aqlli-sunken h-6 overflow-hidden rounded-full border-2 border-[#e6e3d3] bg-[#e6e3d3]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffd93d] to-[#705d00] transition-all duration-1000"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Mening badge&apos;larim</h2>
          {badges.length === 0 ? (
            <ChildEmpty message="Hali yutuqlar yo'q — dars va suhbat bilan badge ochiladi!" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`aqlli-bubbly flex flex-col items-center gap-3 rounded-2xl border-b-4 p-4 text-center ${
                    badge.locked
                      ? "border-[#e6e3d3] bg-[#f2eede]/50 opacity-60 grayscale"
                      : "border-[#ffd93d] bg-[#f2eede]"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-white shadow-sm">
                    <AqlliIcon
                      name={badge.icon}
                      filled={!badge.locked}
                      size="lg"
                      style={{ color: badge.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">{badge.title}</h3>
                    <p className="text-xs text-[#4d4633] opacity-70">{badge.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AqlliShell>
  );
}
