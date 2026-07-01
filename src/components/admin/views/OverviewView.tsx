"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency, PLAN_LABELS } from "@/lib/admin/mockData";
import { fetchAdminOverview } from "@/lib/admin/adminData";
import type { ActivityLogEntry, DashboardMetrics, GrowthPoint, RecentSignup } from "@/lib/admin/types";
import { ADMIN_ROUTES } from "@/lib/admin/routes";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatCard } from "@/components/admin/ui/StatCard";
import { GrowthChart } from "@/components/admin/ui/GrowthChart";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";
import { StatusBadge, planBadgeVariant } from "@/components/admin/ui/StatusBadge";

const logIcons: Record<string, { icon: string; color: string }> = {
  alert: { icon: "warning", color: "text-[var(--admin-error)] bg-[var(--admin-error-light)]" },
  signup: { icon: "person_add", color: "text-[var(--admin-accent-teal)] bg-[#e8fbf4]" },
  payment: { icon: "payments", color: "text-[var(--admin-primary)] bg-[var(--admin-primary-light)]" },
  content: { icon: "edit_note", color: "text-[var(--admin-accent)] bg-[#eeeefb]" },
  system: { icon: "settings_suggest", color: "text-[var(--admin-text-subtle)] bg-[var(--admin-surface-container)]" },
};

export function OverviewView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [signups, setSignups] = useState<RecentSignup[]>([]);
  const [log, setLog] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOverview()
      .then((data) => {
        setMetrics(data.metrics);
        setGrowth(data.growth);
        setSignups(data.signups);
        setLog(data.activityLog);
      })
      .catch(() => setError("Ma'lumotlar yuklanmadi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-[var(--admin-text-muted)]">
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded border border-[var(--admin-error-light)] bg-[var(--admin-error-light)] p-4 text-sm text-[var(--admin-error)]">
        {error ?? "Ma'lumotlar mavjud emas"}
      </div>
    );
  }

  const m = metrics;

  return (
    <>
      <PageHeader
        title="Umumiy ko'rinish"
        description="Platforma metrikalari, faollik va tizim holati — real vaqt rejimida."
        actions={
          <>
            <button type="button" className="px-4 py-2 border border-[var(--admin-accent-teal)] text-[var(--admin-accent-teal)] text-sm font-semibold rounded hover:bg-[#e8fbf4] transition-colors flex items-center gap-2">
              <AdminIcon name="file_download" className="!text-[18px]" />
              Hisobot yuklab olish
            </button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            label="Jami ota-ona"
            value={m.totalParents.toLocaleString("uz-UZ")}
            icon="group"
            trend={{ value: `+${m.userGrowth}%`, positive: true }}
            footer={
              <span className="text-xs text-[var(--admin-text-muted)]">
                <strong className="text-[var(--admin-primary)]">{m.totalChildren.toLocaleString("uz-UZ")}</strong> bola akkaunti
              </span>
            }
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            label="Bugun faol"
            value={m.activeUsersToday.toLocaleString("uz-UZ")}
            icon="bolt"
            trend={{ value: `+${m.activityGrowth}%`, positive: true }}
            accent="teal"
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            label="Bugungi suhbatlar"
            value={m.conversationsToday.toLocaleString("uz-UZ")}
            icon="forum"
            trend={{ value: "+5.2%", positive: true }}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            label="Oylik daromad"
            value={formatCurrency(m.revenueMonth).replace(" so'm", "")}
            icon="account_balance_wallet"
            trend={{ value: `+${m.revenueGrowth}%`, positive: true }}
            footer={<span className="text-xs text-[var(--admin-text-muted)]">so&apos;m / oy</span>}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <GrowthChart data={growth} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <StatCard
            label="AI API holati"
            value={m.aiApiStatus === "online" ? "99.9%" : "—"}
            icon="shield"
            accent="dark"
            footer={
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-[#6ffbbe]">
                  <span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse" />
                  {m.aiApiStatus === "online" ? "Barcha xizmatlar ishlayapti" : "Muammo aniqlandi"}
                </p>
                <p className="text-white/70 text-xs">O&apos;rtacha javob: {m.aiApiLatencyMs}ms</p>
              </div>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 admin-card">
          <div className="p-5 border-b border-[var(--admin-border-light)] flex justify-between items-center">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] flex items-center gap-2">
              <AdminIcon name="person_add" />
              So&apos;nggi ro&apos;yxatdan o&apos;tganlar
            </h3>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {signups.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--admin-surface-low)] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-primary)]">{s.name}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">{s.type === "parent" ? "Ota-ona" : "Bola"}</p>
                </div>
                <div className="text-right">
                  {s.plan && <StatusBadge variant={planBadgeVariant(s.plan)}>{PLAN_LABELS[s.plan]}</StatusBadge>}
                  <p className="admin-mono text-[11px] text-[var(--admin-text-subtle)] mt-1">{s.registeredAt.slice(11, 16)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[var(--admin-border-light)]">
            <Link href={ADMIN_ROUTES.users} className="text-sm font-semibold text-[var(--admin-accent)] hover:underline">
              Barcha foydalanuvchilar →
            </Link>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 admin-card">
          <div className="p-5 border-b border-[var(--admin-border-light)] flex justify-between items-center">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] flex items-center gap-2">
              <AdminIcon name="history" />
              Faollik jurnali
            </h3>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)] max-h-[340px] overflow-y-auto">
            {log.map((entry) => {
              const meta = logIcons[entry.type];
              return (
                <div key={entry.id} className="px-5 py-3 flex items-start gap-4 hover:bg-[var(--admin-surface-low)] transition-colors">
                  <span className={`p-1.5 rounded shrink-0 ${meta.color}`}>
                    <AdminIcon name={meta.icon} className="!text-[18px]" />
                  </span>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-[var(--admin-primary)]">{entry.title}</p>
                    <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{entry.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="admin-mono text-xs text-[var(--admin-text-subtle)]">{entry.time}</p>
                    <p className="text-[10px] text-[var(--admin-text-subtle)] uppercase">{entry.ago}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
