"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_LABELS } from "@/lib/admin/mockData";
import { fetchAdminUsers } from "@/lib/admin/adminData";
import { ADMIN_ROUTES } from "@/lib/admin/routes";
import type { ParentAccount } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchFilterBar, FilterSelect } from "@/components/admin/ui/SearchFilterBar";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { StatusBadge, planBadgeVariant, statusBadgeVariant } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function UsersView() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ParentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAdminUsers()
      .then(setAccounts)
      .catch(() => setError("Foydalanuvchilar yuklanmadi"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return accounts.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q);
      const matchPlan = planFilter === "all" || p.plan === planFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [accounts, search, planFilter, statusFilter]);

  const columns: Column<ParentAccount>[] = [
    {
      key: "name",
      header: "Ism",
      render: (p) => (
        <div>
          <p className="font-semibold text-[var(--admin-primary)]">{p.name}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">{p.city}</p>
        </div>
      ),
    },
    { key: "phone", header: "Telefon", render: (p) => <span className="admin-mono text-xs">{p.phone}</span> },
    { key: "children", header: "Bolalar", render: (p) => p.childrenCount },
    {
      key: "plan",
      header: "Obuna",
      render: (p) => <StatusBadge variant={planBadgeVariant(p.plan)}>{PLAN_LABELS[p.plan]}</StatusBadge>,
    },
    { key: "registered", header: "Ro'yxat", render: (p) => <span className="text-xs">{p.registeredAt}</span> },
    {
      key: "status",
      header: "Holat",
      render: (p) => (
        <StatusBadge variant={statusBadgeVariant(p.status)}>
          {p.status === "active" ? "Faol" : p.status === "blocked" ? "Bloklangan" : "Kutilmoqda"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(ADMIN_ROUTES.userDetail(p.id));
          }}
          className="text-xs font-semibold text-[var(--admin-accent)] hover:underline"
        >
          Ko&apos;rish
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-[var(--admin-text-muted)]">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Foydalanuvchilar boshqaruvi"
        description="Ota-ona akkauntlari — qidiruv, filtrlash va holat boshqaruvi."
        actions={
          <button type="button" className="px-4 py-2 bg-[var(--admin-primary)] text-white text-sm font-semibold rounded hover:bg-[var(--admin-primary-container)] transition-colors flex items-center gap-2">
            <AdminIcon name="add" className="!text-[18px]" />
            Yangi foydalanuvchi
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-error-light)] bg-[var(--admin-error-light)] p-3 text-sm text-[var(--admin-error)]">
          {error}
        </p>
      )}

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Ism, telefon yoki email..."
        filters={
          <>
            <FilterSelect
              label="Obuna"
              value={planFilter}
              onChange={setPlanFilter}
              options={[
                { value: "all", label: "Barcha tariflar" },
                { value: "free", label: "Free" },
                { value: "family", label: "Family" },
                { value: "premium-plus", label: "Premium+" },
              ]}
            />
            <FilterSelect
              label="Holat"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "Barcha holatlar" },
                { value: "active", label: "Faol" },
                { value: "blocked", label: "Bloklangan" },
                { value: "pending", label: "Kutilmoqda" },
              ]}
            />
          </>
        }
      />

      <p className="text-xs text-[var(--admin-text-muted)] mb-3">{filtered.length} ta natija</p>
      {filtered.length === 0 ? (
        <p className="rounded admin-card p-8 text-center text-sm text-[var(--admin-text-muted)]">
          Hali ro&apos;yxatdan o&apos;tgan ota-ona yo&apos;q.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          onRowClick={(p) => router.push(ADMIN_ROUTES.userDetail(p.id))}
        />
      )}
    </>
  );
}
