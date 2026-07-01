"use client";

import { ADMIN_TEAM } from "@/lib/admin/mockData";
import { ROLE_LABELS } from "@/lib/admin/routes";
import { useAdminSession } from "@/lib/admin/AdminContext";
import type { AdminRole } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

const ROLES: AdminRole[] = ["super-admin", "content-manager", "moderator"];

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  "super-admin": "To'liq kirish — foydalanuvchilar, to'lovlar, sozlamalar",
  "content-manager": "Kontent boshqaruvi — darslar, personalar, testlar",
  moderator: "AI nazorati va foydalanuvchi moderatsiyasi",
};

export function SettingsView() {
  const { role, setRole } = useAdminSession();

  return (
    <>
      <PageHeader
        title="Sozlamalar va rollar"
        description="Admin foydalanuvchilar, ruxsat darajalari va tizim sozlamalari."
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="admin-card">
            <div className="p-5 border-b border-[var(--admin-border-light)]">
              <h3 className="text-base font-semibold text-[var(--admin-primary)]">Admin jamoasi</h3>
            </div>
            <div className="divide-y divide-[var(--admin-border-light)]">
              {ADMIN_TEAM.map((admin) => (
                <div key={admin.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--admin-primary-light)] flex items-center justify-center font-bold text-[var(--admin-primary)]">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--admin-primary)]">{admin.name}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{admin.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge variant="info">{ROLE_LABELS[admin.role]}</StatusBadge>
                    <p className="admin-mono text-[10px] text-[var(--admin-text-subtle)] mt-1">
                      Oxirgi kirish: {admin.lastLogin.slice(0, 10)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--admin-border-light)]">
              <button type="button" className="text-sm font-semibold text-[var(--admin-accent)] hover:underline flex items-center gap-1">
                <AdminIcon name="person_add" className="!text-[18px]" />
                Admin qo&apos;shish
              </button>
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Ruxsat darajalari</h3>
            <div className="space-y-4">
              {ROLES.map((r) => (
                <div key={r} className="p-4 rounded bg-[var(--admin-surface-low)] border border-[var(--admin-border-light)]">
                  <p className="font-semibold text-[var(--admin-primary)]">{ROLE_LABELS[r]}</p>
                  <p className="text-sm text-[var(--admin-text-muted)] mt-1">{ROLE_DESCRIPTIONS[r]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="admin-card p-5">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Demo: rol almashtirish</h3>
            <p className="text-sm text-[var(--admin-text-muted)] mb-4">
              Sidebar navigatsiyasi tanlangan rolga qarab o&apos;zgaradi.
            </p>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`w-full text-left px-4 py-3 rounded text-sm font-semibold transition-colors ${
                    role === r
                      ? "bg-[var(--admin-primary)] text-white"
                      : "bg-[var(--admin-surface-low)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-container)]"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">Tizim sozlamalari</h3>
            <div className="space-y-4">
              {[
                { label: "AI API endpoint", value: "https://api.nihol.uz/v1" },
                { label: "Standart til", value: "O'zbek (lotin)" },
                { label: "Kunlik suhbat limiti (Free)", value: "15 daqiqa" },
                { label: "Xavfsizlik darajasi", value: "Yuqori (COPPA mos)" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-[var(--admin-border-light)] last:border-0">
                  <span className="text-sm text-[var(--admin-text-muted)]">{s.label}</span>
                  <span className="text-sm font-semibold text-[var(--admin-primary)]">{s.value}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-4 w-full py-2 text-sm font-semibold bg-[var(--admin-primary)] text-white rounded hover:bg-[var(--admin-primary-container)] transition-colors">
              Sozlamalarni saqlash
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
