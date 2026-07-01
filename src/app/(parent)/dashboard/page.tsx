"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { USE_MOCK, mockAiTips, mockWeeklyActivity } from "@/lib/mockData";
import { getChildren, getDashboardSummary } from "@/lib/parent/parentData";
import { useParentSession } from "@/lib/parent/ParentProvider";
import type { ChildProfile } from "@/lib/parent/types";
import { ActivityBarChart, AiTipsPanel } from "@/components/parent/nurture/ActivityBarChart";
import { ChildProfileCard } from "@/components/parent/nurture/ChildProfileCard";
import { MaterialIcon } from "@/components/parent/nurture/MaterialIcon";
import { useCountUp } from "@/components/parent/nurture/useCountUp";
import { useReducedMotion } from "@/components/parent/nurture/useReducedMotion";

interface InsightData {
  report: {
    summary: string;
    recommendations: string[];
    interests: Array<{ topic: string; evidence: string }>;
    moodAnalysis: { trend: string; averageScore: number; summary: string };
    activity: { activeDays: number; totalMessages: number };
    activitySummary: string;
  };
  insightAlerts: Array<{ summary: string; severity: string }>;
}

function mapSessionChildren(
  sessionChildren: Array<{ id: string; name: string; age: number; language: string }>
): ChildProfile[] {
  return sessionChildren.map((c, i) => ({
    id: c.id,
    name: c.name,
    age: c.age,
    avatarUrl: "",
    status: "Faol",
    progressPercent: 50 + (i % 3) * 15,
    todayMinutes: 20 + i * 10,
    todayXp: 0,
    weeklyXp: 0,
    streakDays: 3 + i,
    interests: [],
    language: c.language,
  }));
}

function DashboardGreeting({ name, summary }: { name: string; summary: string }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-[#4f46e5] p-6 text-[#dad7ff] md:col-span-8 md:p-8">
      <div className="absolute -right-[10%] -top-[20%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10">
        <h1 className="mb-2 text-2xl font-bold md:text-[32px] md:leading-10">
          Xush kelibsiz, {name}! 👋
        </h1>
        <p className="max-w-md text-base opacity-90 md:text-lg">{summary}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#3525cd] shadow-lg transition-transform hover:scale-105"
          >
            To&apos;liq hisobotni ko&apos;rish
          </button>
          <Link
            href="/children"
            className="rounded-2xl border border-white/20 bg-[#3525cd]/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-[#3525cd]/30"
          >
            Yangi bola qo&apos;shish
          </Link>
        </div>
      </div>
      {!reduced && (
        <div className="nurture-float absolute bottom-4 right-8 hidden lg:block">
          <MaterialIcon name="auto_awesome" filled size="xl" className="text-white/20" />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  badge,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  suffix: string;
  badge?: string;
  tone: "secondary" | "tertiary";
}) {
  const display = useCountUp(value, 1200, suffix);
  const iconBg = tone === "secondary" ? "bg-[#9d4300]/10 text-[#9d4300]" : "bg-[#005523]/10 text-[#005523]";

  return (
    <div className="nurture-card flex flex-col justify-between rounded-3xl border border-[#c7c4d8]/10 bg-white p-6 group">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} transition-transform group-hover:scale-110`}>
          <MaterialIcon name={icon} />
        </div>
        {badge && (
          <span className="flex items-center gap-1 text-sm font-bold text-[#005523]">
            <MaterialIcon name="trending_up" className="!text-base" />
            {badge}
          </span>
        )}
        {!badge && <span className="text-sm font-bold text-[#005523]">Haftalik</span>}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-[#777587]">{label}</p>
        <h3 className="text-2xl font-bold text-[#111c2d]">{display}</h3>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useParentSession();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [summary, setSummary] = useState({
    greetingName: "Ota-ona",
    totalHours: 0,
    activeDays: 0,
    weeklyGrowthPercent: 0,
    greetingText: "",
  });
  const [tips, setTips] = useState<
    Array<{ title: string; body: string; icon: string; tone: "primary" | "secondary" }>
  >(USE_MOCK ? mockAiTips : []);
  const [weeklyBars, setWeeklyBars] = useState(USE_MOCK ? mockWeeklyActivity : []);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    async function load() {
      setFetching(true);
      setError(null);
      try {
        if (USE_MOCK) {
          const [mockKids, mockSummary] = await Promise.all([getChildren(), getDashboardSummary()]);
          setChildren(mockKids);
          if (mockSummary) {
            setSummary({
              ...mockSummary,
              greetingText: `Bolalaringiz bugun 2 soatdan ortiq vaqtini foydali o'rganishga sarflashdi. Ularning natijalari kundan-kunga yaxshilanmoqda.`,
            });
          }
          return;
        }

        if (user?.children?.length) {
          const enriched = await getChildren();
          setChildren(enriched.length ? enriched : mapSessionChildren(user.children));
        } else {
          setChildren([]);
        }

        setSummary((prev) => ({
          ...prev,
          greetingName: user?.name ?? user?.email?.split("@")[0] ?? "Ota-ona",
        }));

        const firstChildId = user?.children?.[0]?.id;
        if (!firstChildId) return;

        if (!user?.pinVerified) {
          setTips([]);
          setWeeklyBars([]);
          return;
        }

        const res = await fetch(`/api/parent/insights?childId=${firstChildId}&days=7`);
        const json = await res.json();
        if (json.code === "PIN_REQUIRED") {
          window.location.href = "/pin";
          return;
        }
        if (!json.success) {
          if (json.code === "REPORT_LOCKED") {
            setTips([
              {
                title: "Bepul tarif",
                body: json.error ?? "To'liq hisobot premium tarifda ochiladi.",
                icon: "info",
                tone: "secondary",
              },
            ]);
          } else {
            setError(json.error);
          }
          return;
        }

        const data = json.data as InsightData;
        setSummary((prev) => ({
          ...prev,
          greetingName: user?.name ?? user?.email?.split("@")[0] ?? "Ota-ona",
          activeDays: data.report.activity.activeDays,
          totalHours: Math.round(data.report.activity.totalMessages / 10),
          greetingText: data.report.summary,
        }));

        if (data.report.recommendations.length) {
          setTips(
            data.report.recommendations.slice(0, 2).map((rec, i) => ({
              title: i === 0 ? "Haftalik tavsiya" : "Qo'shimcha",
              body: rec,
              icon: i === 0 ? "lightbulb" : "menu_book",
              tone: (i === 0 ? "primary" : "secondary") as "primary" | "secondary",
            }))
          );
        }
      } catch {
        setError("Ma'lumot yuklanmadi");
      } finally {
        setFetching(false);
      }
    }

    load();
  }, [loading, user]);

  const legend = useMemo(() => {
    const names = children.slice(0, 2).map((c) => c.name);
    return { primary: names[0] ?? "Bola 1", secondary: names[1] ?? "Bola 2" };
  }, [children]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-bold text-[#3525cd]">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-7xl space-y-8 px-4 md:px-6">
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {fetching && (
        <p className="text-sm font-semibold text-[#777587]">Ma&apos;lumotlar yangilanmoqda...</p>
      )}

      {!USE_MOCK && user && !user.pinVerified && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          To&apos;liq hisobot va AI tavsiyalar uchun{" "}
          <Link href="/pin" className="font-bold underline">
            PIN kodni tasdiqlang
          </Link>
          .
        </p>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <DashboardGreeting
          name={summary.greetingName}
          summary={
            summary.greetingText ||
            `${BRAND.name} orqali farzandlaringizning o'rganish jarayonini kuzatib boring.`
          }
        />
        <div className="grid grid-cols-1 gap-6 md:col-span-4">
          <StatCard
            icon="schedule"
            label="Jami o'rganilgan vaqt"
            value={summary.totalHours}
            suffix=" soat"
            badge={`+${summary.weeklyGrowthPercent}%`}
            tone="secondary"
          />
          <StatCard
            icon="calendar_today"
            label="Faol kunlar"
            value={summary.activeDays}
            suffix=" kun"
            tone="tertiary"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111c2d] md:text-2xl">Bolalar profillari</h2>
            <p className="text-sm font-semibold text-[#777587]">
              Har bir farzandingizning bugungi faoliyatini kuzatib boring
            </p>
          </div>
          <Link href="/children" className="text-sm font-bold text-[#3525cd] hover:underline">
            Barchasini ko&apos;rish
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.length === 0 && !USE_MOCK ? (
            <div className="col-span-full rounded-3xl border border-dashed border-[#c7c4d8] bg-[#f9f9ff] p-10 text-center">
              <p className="text-lg font-bold text-[#111c2d]">Hali bola profili yo&apos;q</p>
              <p className="mt-2 text-sm text-[#777587]">
                Bola qo&apos;shgandan so&apos;ng uning faoliyati shu yerda ko&apos;rinadi.
              </p>
              <Link
                href="/children"
                className="mt-4 inline-block rounded-2xl bg-[#3525cd] px-6 py-3 text-sm font-bold text-white"
              >
                Bola qo&apos;shish
              </Link>
            </div>
          ) : null}
          {children.map((child, i) => (
            <ChildProfileCard
              key={child.id}
              id={child.id}
              name={child.name}
              age={child.age}
              avatarUrl={child.avatarUrl}
              progressPercent={child.progressPercent}
              todayMinutes={child.todayMinutes}
              streakDays={child.streakDays ?? 0}
              ringColor={i % 2 === 0 ? "primary" : "secondary"}
              delay={i * 100}
            />
          ))}
          <Link
            href="/children"
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#c7c4d8] p-6 text-center transition-colors hover:border-[#3525cd] hover:bg-[#f0f3ff]"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7eeff] text-[#777587] transition-colors hover:text-[#3525cd]">
              <MaterialIcon name="add" size="lg" />
            </div>
            <h4 className="text-lg font-bold text-[#464555]">Yangi profil qo&apos;shish</h4>
            <p className="mt-1 px-4 text-sm text-[#777587]">
              Farzandingiz uchun yangi ta&apos;lim yo&apos;nalishini boshlang
            </p>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="nurture-card rounded-3xl border border-[#c7c4d8]/10 bg-white p-6 md:p-8 lg:col-span-8">
          <ActivityBarChart days={weeklyBars} legend={legend} />
        </div>
        <div className="lg:col-span-4">
          <AiTipsPanel tips={tips} />
        </div>
      </section>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3525cd] text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        aria-label="Yangi vazifa"
      >
        <MaterialIcon name="add_task" />
      </button>
    </div>
  );
}
