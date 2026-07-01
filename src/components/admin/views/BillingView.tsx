"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, PLAN_LABELS } from "@/lib/admin/mockData";
import { fetchAdminBilling } from "@/lib/admin/adminData";
import type { PlanConfig, Transaction } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { StatusBadge, planBadgeVariant, statusBadgeVariant } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function BillingView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [planConfigs, setPlanConfigs] = useState<PlanConfig[]>([]);
  const [paymentIssues, setPaymentIssues] = useState<
    Array<{ id: string; parent: string; issue: string; amount: number; date: string }>
  >([]);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminBilling()
      .then((data) => {
        setTransactions(data.transactions);
        setPlanConfigs(data.planConfigs);
        setPaymentIssues(data.paymentIssues);
        setRevenueMonth(data.revenueMonth);
      })
      .catch(() => setError("To'lov ma'lumotlari yuklanmadi"))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = useMemo(
    () => transactions.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const txColumns: Column<Transaction>[] = [
    { key: "id", header: "ID", render: (t) => <span className="admin-mono text-xs">{t.id.slice(0, 8)}…</span> },
    { key: "parent", header: "Ota-ona", render: (t) => t.parentName },
    {
      key: "plan",
      header: "Tarif",
      render: (t) => <StatusBadge variant={planBadgeVariant(t.plan)}>{PLAN_LABELS[t.plan]}</StatusBadge>,
    },
    {
      key: "amount",
      header: "Summa",
      render: (t) => <span className="font-semibold">{formatCurrency(t.amount)}</span>,
    },
    { key: "provider", header: "Provayder", render: (t) => t.provider },
    {
      key: "status",
      header: "Holat",
      render: (t) => {
        const labels = { success: "Muvaffaqiyat", failed: "Xato", pending: "Kutilmoqda", refunded: "Qaytarilgan" };
        return <StatusBadge variant={statusBadgeVariant(t.status)}>{labels[t.status]}</StatusBadge>;
      },
    },
    {
      key: "date",
      header: "Sana",
      render: (t) => <span className="admin-mono text-xs">{t.date.slice(0, 16).replace("T", " ")}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-[var(--admin-text-muted)]">
        Yuklanmoqda...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-[var(--admin-error-light)] bg-[var(--admin-error-light)] p-4 text-sm text-[var(--admin-error)]">
        {error}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Obuna va to'lovlar"
        description="Tariflar, tranzaksiyalar, daromad statistikasi va to'lov muammolari."
        actions={
          <button type="button" className="px-4 py-2 border border-[var(--admin-accent-teal)] text-[var(--admin-accent-teal)] text-sm font-semibold rounded flex items-center gap-2">
            <AdminIcon name="file_download" className="!text-[18px]" />
            Moliyaviy hisobot
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4">
          <StatCard
            label="Joriy oy daromadi"
            value={formatCurrency(revenueMonth).replace(" so'm", "")}
            icon="payments"
            footer={<span className="text-xs text-[var(--admin-text-muted)]">so&apos;m</span>}
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <StatCard
            label="Muvaffaqiyatli to'lovlar"
            value={transactions.filter((t) => t.status === "success").length}
            icon="check_circle"
            accent="teal"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <StatCard
            label="Muammoli to'lovlar"
            value={paymentIssues.length}
            icon="error"
            trend={{ value: "Diqqat", positive: false }}
          />
        </div>
      </div>

      <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Tariflar boshqaruvi</h3>
      {planConfigs.length === 0 ? (
        <p className="mb-10 text-sm text-[var(--admin-text-muted)]">Tarif ma&apos;lumotlari yo&apos;q.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {planConfigs.map((plan) => (
            <div key={plan.id} className="admin-card p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-bold text-[var(--admin-primary)]">{plan.name}</h4>
                <StatusBadge variant={planBadgeVariant(plan.id)}>{plan.activeUsers} foydalanuvchi</StatusBadge>
              </div>
              <p className="text-2xl font-bold text-[var(--admin-primary)] mb-4">
                {plan.price === 0 ? "Bepul" : formatCurrency(plan.price)}
                {plan.price > 0 && <span className="text-sm font-normal text-[var(--admin-text-muted)]"> / oy</span>}
              </p>
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-[var(--admin-text-muted)] flex items-center gap-2">
                    <AdminIcon name="check" className="!text-[16px] text-[var(--admin-accent-teal)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <button type="button" className="w-full py-2 text-sm font-semibold border border-[var(--admin-border)] rounded hover:bg-[var(--admin-surface-low)] transition-colors">
                Tarifni tahrirlash
              </button>
            </div>
          ))}
        </div>
      )}

      {paymentIssues.length > 0 && (
        <div className="admin-card p-5 mb-8 border-l-4 border-l-[var(--admin-warning)]">
          <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-3 flex items-center gap-2">
            <AdminIcon name="warning" className="text-[var(--admin-warning)]" />
            To&apos;lov muammolari
          </h3>
          <div className="space-y-2">
            {paymentIssues.map((pi) => (
              <div key={pi.id} className="flex justify-between items-center text-sm py-2 border-b border-[var(--admin-border-light)] last:border-0">
                <div>
                  <span className="font-semibold text-[var(--admin-primary)]">{pi.parent}</span>
                  <span className="text-[var(--admin-text-muted)] ml-2">— {pi.issue}</span>
                </div>
                <span className="admin-mono text-xs">{formatCurrency(pi.amount)} · {pi.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Tranzaksiyalar</h3>
      {transactions.length === 0 ? (
        <p className="rounded admin-card p-8 text-center text-sm text-[var(--admin-text-muted)]">
          Hali to&apos;lovlar yo&apos;q.
        </p>
      ) : (
        <>
          <p className="text-xs text-[var(--admin-text-muted)] mb-3">
            Jami muvaffaqiyatli: {formatCurrency(totalRevenue)}
          </p>
          <DataTable columns={txColumns} data={transactions} keyField="id" />
        </>
      )}
    </>
  );
}
