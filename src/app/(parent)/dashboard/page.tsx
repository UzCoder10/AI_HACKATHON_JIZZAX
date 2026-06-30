"use client";

import { useEffect, useState } from "react";
import { ParentShell, ChildSelector } from "@/components/parent/ParentShell";
import { MoodChart } from "@/components/parent/MoodChart";
import { useParentSession } from "@/lib/parent/ParentProvider";

interface InsightData {
  report: {
    summary: string;
    recommendations: string[];
    interests: Array<{ topic: string; evidence: string }>;
    moodAnalysis: { trend: string; averageScore: number; summary: string };
    activity: { activeDays: number; totalMessages: number };
    activitySummary: string;
  };
  moodChart: Array<{ date: string; score: number; emoji: string }>;
  insightAlerts: Array<{ summary: string; severity: string }>;
}

export default function DashboardPage() {
  const { user, loading, selectedChildId } = useParentSession();
  const [data, setData] = useState<InsightData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChild = user?.children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    if (!selectedChildId || !user?.pinVerified) return;

    async function load() {
      setFetching(true);
      setError(null);
      try {
        const res = await fetch(`/api/parent/insights?childId=${selectedChildId}&days=7`);
        const json = await res.json();
        if (json.code === "PIN_REQUIRED") {
          window.location.href = "/pin";
          return;
        }
        if (!json.success) {
          setError(json.error);
          return;
        }
        setData(json.data);
      } catch {
        setError("Ma'lumot yuklanmadi");
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [selectedChildId, user?.pinVerified]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-primary font-bold">
        Yuklanmoqda...
      </div>
    );
  }

  const progressPct = data
    ? Math.min(100, Math.round((data.report.activity.activeDays / 7) * 100))
    : 0;

  return (
    <ParentShell
      title="Command Center"
      subtitle={
        selectedChild
          ? `${selectedChild.name}ning o'rganish sarguzashtini kuzatish`
          : "Farzandingizning haftalik faolligi"
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 justify-between">
        <ChildSelector />
        <p className="text-xs text-outline italic font-medium">
          So&apos;zma-so&apos;z suhbat ko&apos;rsatilmaydi
        </p>
      </div>

      {error && (
        <p className="text-red-700 bg-red-50 border border-red-200 p-4 rounded-2xl mb-4 font-medium text-sm">
          {error}
        </p>
      )}
      {fetching && (
        <p className="text-outline font-semibold mb-4">Yuklanmoqda...</p>
      )}

      {data && (
        <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
          {data.insightAlerts.length > 0 && (
            <section className="col-span-4 md:col-span-12 bg-secondary-container/20 border border-secondary-container/40 rounded-2xl p-5 shadow-ambient-secondary">
              <h2 className="font-extrabold text-on-secondary-container mb-2">
                Kayfiyat signallari (tashxis emas)
              </h2>
              {data.insightAlerts.map((a, i) => (
                <p key={i} className="text-sm text-on-surface font-medium">
                  {a.summary}
                </p>
              ))}
            </section>
          )}

          <article className="col-span-4 md:col-span-8 bg-surface-container-lowest rounded-2xl shadow-ambient-primary p-6 md:p-8 bento-tile flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-xl">
                  📚
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Haftalik faollik</h2>
                  <p className="text-sm text-outline font-semibold mt-0.5">
                    {data.report.activity.totalMessages} xabar · {data.report.activity.activeDays} faol kun
                  </p>
                </div>
              </div>
              <div className="hidden md:block text-2xl font-black text-primary">{progressPct}%</div>
            </div>
            <div className="relative z-10">
              <div className="h-6 w-full bg-primary/15 rounded-full overflow-hidden p-1">
                <div
                  className="h-full bg-tertiary-fixed rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-sm text-outline font-medium mt-3">{data.report.activitySummary}</p>
            </div>
          </article>

          <article className="col-span-4 md:col-span-4 bg-surface-container-lowest rounded-2xl shadow-ambient-secondary p-6 bento-tile">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-on-surface">Haftalik kayfiyat</h3>
              <span className="text-2xl">😊</span>
            </div>
            <MoodChart data={data.moodChart} />
            <p className="text-xs text-outline font-semibold mt-3">{data.report.moodAnalysis.summary}</p>
          </article>

          <section className="col-span-4 md:col-span-12 bg-surface-container-lowest rounded-2xl shadow-vibrant-primary p-6 bento-tile border border-surface-container-low">
            <h2 className="font-extrabold text-on-surface mb-3">Haftalik xulosa</h2>
            <p className="text-on-surface-variant leading-relaxed font-medium">{data.report.summary}</p>
          </section>

          <section className="col-span-4 md:col-span-6 bg-surface-container-lowest rounded-2xl p-6 shadow-vibrant-primary bento-tile">
            <h2 className="font-extrabold text-on-surface mb-3">Qiziqishlar</h2>
            {data.report.interests.length === 0 ? (
              <p className="text-outline text-sm font-medium">Hali aniqlanmadi</p>
            ) : (
              <ul className="space-y-3">
                {data.report.interests.map((item, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-extrabold text-primary">{item.topic}</span>
                    <p className="text-outline text-xs mt-0.5 font-medium">{item.evidence}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="col-span-4 md:col-span-6 bg-surface-container-lowest rounded-2xl p-6 shadow-vibrant-secondary bento-tile">
            <h2 className="font-extrabold text-on-surface mb-3">Statistika</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-primary">{data.report.activity.activeDays}</p>
                <p className="text-xs text-outline font-bold mt-1">Faol kunlar</p>
              </div>
              <div className="bg-surface-container rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-secondary">{data.report.activity.totalMessages}</p>
                <p className="text-xs text-outline font-bold mt-1">Xabarlar</p>
              </div>
            </div>
            <p className="text-xs text-outline font-semibold mt-3">
              Trend: {data.report.moodAnalysis.trend} · O&apos;rtacha: {data.report.moodAnalysis.averageScore}/5
            </p>
          </section>

          {data.report.recommendations.length > 0 && (
            <section className="col-span-4 md:col-span-12 bg-primary-fixed/40 border border-primary/20 rounded-2xl p-6">
              <h2 className="font-extrabold text-primary mb-3">Tavsiyalar</h2>
              <ul className="space-y-2">
                {data.report.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-on-surface font-medium flex gap-2">
                    <span>💡</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </ParentShell>
  );
}
