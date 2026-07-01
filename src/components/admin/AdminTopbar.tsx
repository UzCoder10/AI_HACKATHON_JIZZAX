"use client";

import { useAdminSession } from "@/lib/admin/AdminContext";
import { AdminIcon } from "./ui/AdminIcon";

interface AdminTopbarProps {
  title: string;
}

export function AdminTopbar({ title }: AdminTopbarProps) {
  const { adminName } = useAdminSession();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--admin-border-light)] bg-[var(--admin-bg)] px-6">
      <div className="flex items-center gap-6">
        <span className="text-base font-bold text-[var(--admin-primary)]">{title}</span>
        <div className="relative hidden md:block">
          <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-subtle)] !text-[18px]" />
          <input
            type="search"
            placeholder="Global qidiruv..."
            className="w-64 pl-10 pr-4 py-1.5 text-sm bg-[var(--admin-surface-low)] border border-[var(--admin-border)] rounded focus:ring-2 focus:ring-[var(--admin-primary)] focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="p-1.5 rounded text-[var(--admin-text-subtle)] hover:bg-[var(--admin-surface-container)] transition-colors" aria-label="Bildirishnomalar">
          <AdminIcon name="notifications" />
        </button>
        <button type="button" className="p-1.5 rounded text-[var(--admin-text-subtle)] hover:bg-[var(--admin-surface-container)] transition-colors" aria-label="Xavfsizlik">
          <AdminIcon name="shield" />
        </button>
        <div className="h-6 w-px bg-[var(--admin-border)] mx-1" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-wide">{adminName}</p>
            <p className="text-[10px] text-[var(--admin-text-subtle)] leading-none">Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--admin-primary-light)] border border-[var(--admin-primary)] flex items-center justify-center text-sm font-bold text-[var(--admin-primary)]">
            {adminName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
