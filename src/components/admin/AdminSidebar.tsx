"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { navForRole, ROLE_LABELS } from "@/lib/admin/routes";
import { useAdminSession } from "@/lib/admin/AdminContext";
import { AdminIcon } from "./ui/AdminIcon";

export function AdminSidebar() {
  const pathname = usePathname();
  const { role } = useAdminSession();
  const items = navForRole(role);

  return (
    <nav
      className="fixed left-0 top-0 z-50 flex h-screen w-[var(--admin-sidebar-width)] flex-col border-r border-[var(--admin-border)] bg-[var(--admin-primary)] py-6 text-white"
      aria-label="Admin navigatsiya"
    >
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold tracking-tight">{BRAND.name}</h1>
        <p className="text-xs text-[#98a4c9] mt-1">Admin Portal</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#3a4666] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6ffbbe]">
          <AdminIcon name="verified_user" className="!text-[14px]" filled />
          {ROLE_LABELS[role]}
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                active ? "admin-nav-active" : "text-[#98a4c9] hover:bg-[var(--admin-primary-container)] hover:text-white"
              }`}
            >
              <AdminIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-white/10 pt-4 px-6 space-y-1">
        <Link href="/" className="flex items-center gap-3 py-2 text-sm text-[#98a4c9] hover:text-white transition-colors">
          <AdminIcon name="open_in_new" />
          Saytga qaytish
        </Link>
        <button type="button" className="mt-2 w-full rounded bg-[var(--admin-error)] py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
          Chiqish
        </button>
      </div>
    </nav>
  );
}
