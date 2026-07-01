"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { USE_MOCK } from "@/lib/mockData";
import { getChildById } from "@/lib/parent/parentData";
import { PARENT_ROUTES } from "@/lib/parent/routes";
import { useParentSession } from "@/lib/parent/ParentProvider";
import type { ChildDetail } from "@/lib/parent/types";
import { InterestsDonut } from "./InterestsDonut";
import { MaterialIcon } from "./MaterialIcon";
import { useCountUp } from "./useCountUp";
import { useReducedMotion } from "./useReducedMotion";

const sessionToneClass = {
  primary: "bg-[#e2dfff] text-[#3525cd]",
  secondary: "bg-[#ffdbca] text-[#9d4300]",
  tertiary: "bg-[#007030] text-[#63f889]",
  neutral: "bg-[#d8e3fb] text-[#464555]",
};

const xpToneClass = {
  primary: "text-[#3525cd]",
  secondary: "text-[#9d4300]",
  tertiary: "text-[#005523]",
  neutral: "text-[#464555]",
};

function WeeklyBars({
  days,
}: {
  days: Array<{ label: string; height: number; highlight?: boolean }>;
}) {
  const reduced = useReducedMotion();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-bold text-[#111c2d] md:text-2xl">Haftalik faollik</h4>
        <select className="cursor-pointer rounded-xl border-none bg-[#f0f3ff] px-4 py-1 text-sm font-semibold focus:ring-0">
          <option>Oxirgi 7 kun</option>
          <option>Oxirgi oy</option>
        </select>
      </div>
      <div className="relative flex h-64 items-end justify-between gap-2 px-2 pt-8">
        <div className="absolute inset-0 flex flex-col justify-between py-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-full border-t border-dashed border-[#c7c4d8]/30" />
          ))}
        </div>
        {days.map((day, i) => (
          <div key={day.label} className="relative z-10 flex flex-1 flex-col items-center gap-2">
            <div
              className={`relative w-full rounded-t-lg bg-[#4f46e5]/10 ${day.highlight ? "h-[90%]" : ""}`}
              style={day.highlight ? undefined : { height: `${day.height}%` }}
            >
              <div
                className={
                  reduced
                    ? `absolute bottom-0 w-full rounded-t-lg ${day.highlight ? "bg-[#fd761a] shadow-[0_-4px_12px_rgba(253,118,26,0.3)]" : "bg-[#3525cd]"}`
                    : `nurture-bar absolute bottom-0 w-full rounded-t-lg ${day.highlight ? "bg-[#fd761a] shadow-[0_-4px_12px_rgba(253,118,26,0.3)]" : "bg-[#3525cd]"}`
                }
                style={{
                  height: "100%",
                  animationDelay: reduced ? undefined : `${0.1 + i * 0.1}s`,
                  ...(reduced ? { "--bar-height": "100%" } : {}),
                } as React.CSSProperties}
              />
            </div>
            <span
              className={`text-xs text-[#777587] ${day.highlight ? "font-bold text-[#9d4300]" : ""}`}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChildProfileView({ childId }: { childId: string }) {
  const { user, loading: sessionLoading } = useParentSession();
  const [child, setChild] = useState<ChildDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const xpDisplay = useCountUp(child?.todayXp ?? 0, 1200);

  useEffect(() => {
    if (sessionLoading) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (
          !USE_MOCK &&
          user?.children?.length &&
          !user.children.some((c) => c.id === childId)
        ) {
          setChild(null);
          return;
        }
        const detail = await getChildById(childId);
        setChild(detail);
      } catch {
        setError("Ma'lumot yuklanmadi. Qayta urinib ko'ring.");
        setChild(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [childId, sessionLoading, user]);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-bold text-[#3525cd]">
        Yuklanmoqda...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <Link href={PARENT_ROUTES.dashboard} className="text-sm font-semibold text-[#4f46e5] hover:underline">
          ← Dashboard
        </Link>
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <Link href={PARENT_ROUTES.dashboard} className="text-sm font-semibold text-[#4f46e5] hover:underline">
          ← Dashboard
        </Link>
        <p className="mt-4 text-[#777587]">Bola profili topilmadi.</p>
      </div>
    );
  }

  const displayName = child.fullName ?? child.name;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:space-y-8 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={PARENT_ROUTES.dashboard}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#4f46e5] hover:underline"
        >
          <MaterialIcon name="arrow_back" size="sm" />
          Dashboard
        </Link>
        <Link
          href={`/child?childId=${encodeURIComponent(childId)}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3525cd] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#4f46e5]"
        >
          <MaterialIcon name="child_care" size="sm" className="text-white" />
          Bola rejimiga o&apos;tish
        </Link>
      </div>

      {!USE_MOCK && user && !user.pinVerified && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          To&apos;liq AI tavsiyalar va qiziqishlar uchun PIN kodni tasdiqlang.
        </p>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="nurture-card flex flex-col items-center gap-6 rounded-3xl bg-white p-6 md:flex-row md:p-8 lg:col-span-8">
          <div className="relative shrink-0">
            {child.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={child.avatarUrl}
                alt={displayName}
                className="h-32 w-32 rounded-full border-4 border-[#e2dfff] object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#e2dfff] bg-[#e7eeff] text-4xl font-bold text-[#3525cd]">
                {child.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-full bg-[#fd761a] p-2 text-white shadow-md">
              <MaterialIcon name="star" filled className="!text-xl text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold text-[#111c2d] md:text-[32px]">{displayName}</h3>
              <span className="rounded-full bg-[#dee8ff] px-3 py-1 text-sm font-bold text-[#3525cd]">
                {child.age} yosh
              </span>
            </div>
            <p className="mb-4 text-base text-[#464555]">
              Hozirgi holat: <span className="font-bold text-[#005523]">{child.status}</span>
            </p>
            <div className="relative w-full rounded-full bg-[#e7eeff] h-3">
              <div
                className={reduced ? "h-3 rounded-full bg-[#3525cd] shadow-[0_0_8px_rgba(53,37,205,0.4)]" : "nurture-progress-bar h-3 rounded-full bg-[#3525cd] shadow-[0_0_8px_rgba(53,37,205,0.4)]"}
                style={{ "--progress-width": `${child.progressPercent}%` } as React.CSSProperties}
              />
              <span className="absolute -top-6 right-0 text-sm font-bold text-[#3525cd]">
                Umumiy progress: {child.progressPercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-3xl bg-[#4f46e5] p-6 text-[#dad7ff] md:p-8 lg:col-span-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider opacity-80">Bugungi natija</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{xpDisplay}</span>
            <span className="text-2xl font-semibold">ball</span>
          </div>
          <p className="mt-2 text-base opacity-90">{child.todayXpDelta ?? `${BRAND.name} orqali kuzatilmoqda`}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="nurture-card rounded-3xl bg-white p-6 md:col-span-6 md:p-8 lg:col-span-4">
          <InterestsDonut interests={child.interests.length ? child.interests : [{ label: "Umumiy", percent: 100, color: "#4f46e5" }]} />
        </div>
        <div className="nurture-card rounded-3xl bg-white p-6 md:col-span-6 md:p-8 lg:col-span-8">
          <WeeklyBars days={child.weeklyActivity ?? []} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#dee8ff] to-white p-6 shadow-[0_10px_30px_rgba(79,70,229,0.08)] md:p-8 lg:col-span-6">
          {!reduced && (
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <MaterialIcon name="auto_awesome" size="xl" className="text-[#3525cd]" />
            </div>
          )}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3525cd] text-white">
              <MaterialIcon name="psychology" />
            </div>
            <h4 className="text-xl font-bold text-[#111c2d] md:text-2xl">AI Tavsiyalari</h4>
          </div>
          <p className="mb-6 text-lg font-medium leading-relaxed text-[#111c2d]">
            &ldquo;{child.aiSummary ?? "Hali tavsiyalar shakllanmagan."}&rdquo;
          </p>
          <div className="space-y-4">
            {(child.aiRecommendations ?? []).map((rec, i) => (
              <div
                key={`${rec.title}-${i}`}
                className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#3525cd]/10 bg-white/60 p-4 transition-colors hover:border-[#3525cd]/30"
              >
                <div className="rounded-xl bg-[#e2dfff] p-2">
                  <MaterialIcon name={rec.icon} className="text-[#3525cd]" />
                </div>
                <div>
                  <p className="text-sm font-bold">{rec.title}</p>
                  <p className="text-xs text-[#464555]">{rec.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="nurture-card rounded-3xl bg-white p-6 md:p-8 lg:col-span-6">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xl font-bold text-[#111c2d] md:text-2xl">So&apos;nggi mashg&apos;ulotlar</h4>
            <button type="button" className="text-sm font-bold text-[#3525cd] hover:underline">
              Hammasini ko&apos;rish
            </button>
          </div>
          <div className="max-h-[380px] space-y-2 overflow-y-auto pr-2">
            {(child.recentSessions ?? []).length === 0 ? (
              <p className="text-sm text-[#777587]">Mashg&apos;ulotlar tarixi hali yo&apos;q.</p>
            ) : (
              child.recentSessions!.map((session, i) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-2xl border-b border-[#c7c4d8]/10 p-4 transition-colors hover:bg-[#f0f3ff] ${reduced ? "" : "nurture-fade-in"}`}
                  style={reduced ? undefined : ({ animationDelay: `${0.1 + i * 0.1}s` } as React.CSSProperties)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${sessionToneClass[session.tone]}`}>
                      <MaterialIcon name={session.icon} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{session.title}</p>
                      <p className="text-xs text-[#777587]">
                        {session.time} • {session.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${xpToneClass[session.tone]}`}>+{session.xp}</p>
                    <p className="text-[10px] uppercase tracking-tighter text-[#777587]">Tajriba</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
