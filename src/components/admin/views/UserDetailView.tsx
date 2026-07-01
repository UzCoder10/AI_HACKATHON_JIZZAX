"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { PLAN_LABELS } from "@/lib/admin/mockData";
import { fetchAdminUserDetail } from "@/lib/admin/adminData";
import type { ChildAccount, ParentAccount } from "@/lib/admin/types";
import { ADMIN_ROUTES } from "@/lib/admin/routes";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge, planBadgeVariant, statusBadgeVariant } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function UserDetailView({ id }: { id: string }) {
  const [parent, setParent] = useState<ParentAccount | null>(null);
  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [monthlyConversations, setMonthlyConversations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    fetchAdminUserDetail(id)
      .then((data) => {
        setParent(data.parent);
        setChildren(data.children);
        setMonthlyConversations(data.monthlyConversations);
      })
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-[var(--admin-text-muted)]">
        Yuklanmoqda...
      </div>
    );
  }

  if (notFoundFlag || !parent) notFound();

  return (
    <>
      <div className="mb-4">
        <Link href={ADMIN_ROUTES.users} className="text-sm text-[var(--admin-accent)] hover:underline flex items-center gap-1">
          <AdminIcon name="arrow_back" className="!text-[16px]" />
          Foydalanuvchilarga qaytish
        </Link>
      </div>

      <PageHeader
        title={parent.name}
        description={`${parent.email} · ${parent.phone}`}
        actions={
          <>
            {parent.status === "blocked" ? (
              <button type="button" className="px-4 py-2 border border-[var(--admin-accent-teal)] text-[var(--admin-accent-teal)] text-sm font-semibold rounded">
                Faollashtirish
              </button>
            ) : (
              <button type="button" className="px-4 py-2 border border-[var(--admin-error)] text-[var(--admin-error)] text-sm font-semibold rounded">
                Bloklash
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="admin-card p-6">
            <h3 className="admin-label-caps text-[var(--admin-text-muted)] mb-4">Profil ma&apos;lumotlari</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Shahar</dt><dd className="font-medium">{parent.city}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Obuna</dt><dd><StatusBadge variant={planBadgeVariant(parent.plan)}>{PLAN_LABELS[parent.plan]}</StatusBadge></dd></div>
              <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Holat</dt><dd><StatusBadge variant={statusBadgeVariant(parent.status)}>{parent.status === "active" ? "Faol" : parent.status === "blocked" ? "Bloklangan" : "Kutilmoqda"}</StatusBadge></dd></div>
              <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Ro&apos;yxat</dt><dd>{parent.registeredAt}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Oxirgi faollik</dt><dd className="admin-mono text-xs">{parent.lastActive.slice(0, 16).replace("T", " ")}</dd></div>
            </dl>
          </div>

          <div className="admin-card p-6">
            <h3 className="admin-label-caps text-[var(--admin-text-muted)] mb-4">Faollik xulosasi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[var(--admin-surface-low)] rounded">
                <p className="text-2xl font-bold text-[var(--admin-primary)]">{parent.childrenCount}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Bola</p>
              </div>
              <div className="text-center p-3 bg-[var(--admin-surface-low)] rounded">
                <p className="text-2xl font-bold text-[var(--admin-primary)]">{monthlyConversations}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Suhbat / oy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="admin-card">
            <div className="p-5 border-b border-[var(--admin-border-light)]">
              <h3 className="text-base font-semibold text-[var(--admin-primary)] flex items-center gap-2">
                <AdminIcon name="child_care" />
                Bolalar ({children.length})
              </h3>
            </div>
            {children.length === 0 ? (
              <p className="p-6 text-sm text-[var(--admin-text-muted)]">Bola profillari yo&apos;q.</p>
            ) : (
              <div className="divide-y divide-[var(--admin-border-light)]">
                {children.map((child) => (
                  <div key={child.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--admin-primary)]">{child.name}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{child.age} yosh · {child.xp} XP · {child.streakDays} kun streak</p>
                    </div>
                    <StatusBadge variant={statusBadgeVariant(child.status)}>
                      {child.status === "active" ? "Faol" : "Bloklangan"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
