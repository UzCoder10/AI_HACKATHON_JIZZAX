"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminChildren } from "@/lib/admin/adminData";
import type { ChildAccount } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchFilterBar, FilterSelect } from "@/components/admin/ui/SearchFilterBar";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { StatusBadge, statusBadgeVariant } from "@/components/admin/ui/StatusBadge";

export function ChildrenView() {
  const [accounts, setAccounts] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAdminChildren()
      .then(setAccounts)
      .catch(() => setError("Bolalar ro'yxati yuklanmadi"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return accounts.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.parentName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [accounts, search, statusFilter]);

  const columns: Column<ChildAccount>[] = [
    {
      key: "name",
      header: "Bola",
      render: (c) => (
        <div>
          <p className="font-semibold text-[var(--admin-primary)]">{c.name}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">{c.age} yosh</p>
        </div>
      ),
    },
    { key: "parent", header: "Ota-ona", render: (c) => c.parentName },
    { key: "xp", header: "XP", render: (c) => <span className="font-semibold">{c.xp}</span> },
    { key: "streak", header: "Streak", render: (c) => `${c.streakDays} kun` },
    {
      key: "interests",
      header: "Qiziqishlar",
      render: (c) => (
        <span className="text-xs text-[var(--admin-text-muted)]">
          {c.interests.length ? c.interests.slice(0, 2).join(", ") : "—"}
        </span>
      ),
    },
    {
      key: "lastSession",
      header: "Oxirgi sessiya",
      render: (c) => <span className="admin-mono text-xs">{c.lastSession}</span>,
    },
    {
      key: "status",
      header: "Holat",
      render: (c) => (
        <StatusBadge variant={statusBadgeVariant(c.status)}>
          {c.status === "active" ? "Faol" : "Bloklangan"}
        </StatusBadge>
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
        title="Bola akkauntlari"
        description="Barcha bola profillari — faollik, qiziqishlar va holat."
      />

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-error-light)] bg-[var(--admin-error-light)] p-3 text-sm text-[var(--admin-error)]">
          {error}
        </p>
      )}

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Bola yoki ota-ona ismi..."
        filters={
          <FilterSelect
            label="Holat"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Barcha holatlar" },
              { value: "active", label: "Faol" },
              { value: "blocked", label: "Bloklangan" },
            ]}
          />
        }
      />

      {filtered.length === 0 ? (
        <p className="rounded admin-card p-8 text-center text-sm text-[var(--admin-text-muted)]">
          Bola profillari topilmadi.
        </p>
      ) : (
        <DataTable columns={columns} data={filtered} keyField="id" />
      )}
    </>
  );
}
