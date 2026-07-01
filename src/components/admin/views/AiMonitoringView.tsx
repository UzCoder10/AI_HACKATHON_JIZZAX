"use client";

import { useEffect, useState } from "react";
import { fetchAdminAi } from "@/lib/admin/adminData";
import type { AdminAiData } from "@/lib/admin/adminData";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatCard } from "@/components/admin/ui/StatCard";
import { StatusBadge, severityBadgeVariant } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function AiMonitoringView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<AdminAiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminAi()
      .then(setData)
      .catch(() => setError("AI monitoring yuklanmadi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-[var(--admin-text-muted)]">
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded border border-[var(--admin-error-light)] bg-[var(--admin-error-light)] p-4 text-sm text-[var(--admin-error)]">
        {error ?? "Ma'lumotlar mavjud emas"}
      </div>
    );
  }

  const { stats: aiStats, conversations: aiConversations, alerts: aiAlerts } = data;
  const flaggedConversations = aiConversations.filter((c) => c.flagged);
  const topMax = aiStats.topFigures[0]?.count ?? 1;

  return (
    <>
      <PageHeader
        title="AI nazorati"
        description="Bola-AI suhbatlari monitoringi, xavfsizlik ogohlantirishlari va statistika. Maxfiylik: batafsil suhbat faqat kerak bo'lganda ochiladi."
      />

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <StatCard label="Bugungi suhbatlar" value={aiStats.totalConversationsToday.toLocaleString("uz-UZ")} icon="forum" />
        </div>
        <div className="col-span-12 md:col-span-3">
          <StatCard
            label="Belgilangan"
            value={aiStats.flaggedToday}
            icon="flag"
            trend={{ value: "Tekshirish kerak", positive: false }}
            accent="teal"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <StatCard label="Bloklangan javoblar" value={aiStats.blockedResponses} icon="block" />
        </div>
        <div className="col-span-12 md:col-span-3">
          <StatCard
            label="Xavfsizlik bali"
            value={`${aiStats.safetyScore}%`}
            icon="verified_user"
            accent="dark"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-7 admin-card">
          <div className="p-5 border-b border-[var(--admin-border-light)] flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] flex items-center gap-2">
              <AdminIcon name="shield_lock" />
              Shubhali suhbatlar
            </h3>
            <span className="text-xs text-[var(--admin-text-muted)]">PII himoyalangan</span>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {flaggedConversations.length === 0 ? (
              <p className="p-6 text-sm text-[var(--admin-text-muted)]">Bugun shubhali suhbatlar yo&apos;q.</p>
            ) : (
              flaggedConversations.map((conv) => (
                <div key={conv.id} className="admin-secure-zone m-4 rounded">
                  <button
                    type="button"
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--admin-primary)]">
                        {conv.childName} · {conv.figureName}
                      </p>
                      <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{conv.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {conv.severity && (
                        <StatusBadge variant={severityBadgeVariant(conv.severity)}>
                          {conv.severity === "high" ? "Yuqori" : conv.severity === "medium" ? "O'rta" : conv.severity}
                        </StatusBadge>
                      )}
                      <AdminIcon name={expandedId === conv.id ? "expand_less" : "expand_more"} />
                    </div>
                  </button>
                  {expandedId === conv.id && (
                    <div className="px-4 pb-4 border-t border-[var(--admin-border-light)] bg-white/80">
                      <p className="admin-label-caps text-[var(--admin-text-subtle)] mt-3 mb-2">Suhbat xulosasi (maxfiy)</p>
                      <p className="text-sm text-[var(--admin-text-muted)] mb-3">
                        {conv.messageCount} ta xabar · {conv.startedAt.slice(0, 16).replace("T", " ")}
                      </p>
                      <div className="bg-[var(--admin-surface-low)] rounded p-3 text-xs font-mono text-[var(--admin-text-muted)]">
                        [Moderator tasdiqlashi kerak] To&apos;liq transkript faqat super-admin va moderator ruxsati bilan ochiladi.
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button type="button" className="px-3 py-1.5 bg-[var(--admin-primary)] text-white text-xs font-semibold rounded">
                          Transkriptni ochish
                        </button>
                        <button type="button" className="px-3 py-1.5 border border-[var(--admin-accent-teal)] text-[var(--admin-accent-teal)] text-xs font-semibold rounded">
                          Hal qilindi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="admin-card p-5">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Xavfsizlik ogohlantirishlari</h3>
            <div className="space-y-3">
              {aiAlerts.length === 0 ? (
                <p className="text-sm text-[var(--admin-text-muted)]">Ogohlantirishlar yo&apos;q.</p>
              ) : (
                aiAlerts.map((alert) => (
                  <div key={alert.id} className="flex gap-3 p-3 rounded bg-[var(--admin-surface-low)]">
                    <AdminIcon
                      name={alert.severity === "critical" ? "error" : "warning"}
                      className={`shrink-0 !text-[20px] ${alert.severity === "critical" ? "text-[var(--admin-error)]" : "text-[var(--admin-warning)]"}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--admin-primary)]">{alert.childName}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{alert.reason}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge variant={severityBadgeVariant(alert.severity)}>
                          {alert.severity === "critical" ? "Kritik" : alert.severity === "high" ? "Yuqori" : "O'rta"}
                        </StatusBadge>
                        {alert.reviewed && <span className="text-[10px] text-[var(--admin-accent-teal)]">Ko&apos;rib chiqilgan</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Mashhur mentorlar</h3>
            <div className="space-y-3">
              {aiStats.topFigures.length === 0 ? (
                <p className="text-sm text-[var(--admin-text-muted)]">Hali suhbatlar yo&apos;q.</p>
              ) : (
                aiStats.topFigures.map((f, i) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-[var(--admin-text-subtle)]">{i + 1}</span>
                    <div className="flex-1 h-2 bg-[var(--admin-surface-container)] rounded overflow-hidden">
                      <div
                        className="h-full bg-[var(--admin-accent)] rounded"
                        style={{ width: `${(f.count / topMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-20 text-right">{f.name}</span>
                    <span className="admin-mono text-xs text-[var(--admin-text-subtle)] w-14 text-right">{f.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="p-5 border-b border-[var(--admin-border-light)]">
          <h3 className="text-base font-semibold text-[var(--admin-primary)]">Barcha suhbatlar (xulosa)</h3>
          <p className="text-xs text-[var(--admin-text-muted)] mt-1">Shaxsiy ma&apos;lumotlar yashirilgan — faqat metadata</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border-light)] bg-[var(--admin-surface-low)]">
                {["Bola", "Mentor", "Xabarlar", "Vaqt", "Holat"].map((h) => (
                  <th key={h} className="admin-label-caps text-left px-4 py-3 text-[var(--admin-text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border-light)]">
              {aiConversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--admin-text-muted)]">
                    Suhbatlar hali mavjud emas.
                  </td>
                </tr>
              ) : (
                aiConversations.map((c) => (
                  <tr key={c.id} className="admin-table-row">
                    <td className="px-4 py-2.5 font-semibold text-[var(--admin-primary)]">{c.childName}</td>
                    <td className="px-4 py-2.5">{c.figureName}</td>
                    <td className="px-4 py-2.5 admin-mono">{c.messageCount}</td>
                    <td className="px-4 py-2.5 admin-mono text-xs">{c.startedAt.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-4 py-2.5">
                      {c.flagged ? (
                        <StatusBadge variant="warning">Belgilangan</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">Normal</StatusBadge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
