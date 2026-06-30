"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useParentSession } from "@/lib/parent/ParentProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";

const NAV = [
  { href: "/dashboard", label: "Command Center", icon: "📊" },
  { href: "/children", label: "Bolalar", icon: "👧" },
  { href: "/safety", label: "Xavfsizlik", icon: "🛡️" },
  { href: "/transparency", label: "Shaffoflik", icon: "👁️" },
  { href: "/subscription", label: "Tariflar", icon: "💳" },
  { href: "/settings", label: "Sozlamalar", icon: "⚙️" },
];

export function ParentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useParentSession();

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white border-r border-surface-variant min-h-screen p-5 flex flex-col shadow-soft-blue">
      <div className="mb-8">
        <BrandLogo href="/dashboard" size="sm" />
        <p className="text-xs text-outline truncate mt-2 font-medium">{user?.email}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition ${
              pathname.startsWith(href)
                ? "bg-primary text-on-primary shadow-btn-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
            }`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-4 w-full py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl font-bold border border-red-100"
      >
        Chiqish
      </button>
    </aside>
  );
}

export function ParentShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      <ParentSidebar />
      <div className="flex-1 px-4 md:px-16 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">{title}</h1>
          {subtitle && <p className="text-body-lg text-outline mt-1 font-medium">{subtitle}</p>}
        </header>
        {children}
      </div>
    </div>
  );
}

export function ChildSelector() {
  const { user, selectedChildId, setSelectedChildId } = useParentSession();

  if (!user?.children.length) {
    return (
      <p className="text-sm text-on-secondary-container bg-secondary-container/30 px-4 py-3 rounded-xl font-semibold border border-secondary-container/40">
        Avval bola profili qo&apos;shing →{" "}
        <Link href="/children" className="underline font-bold text-primary">
          Bolalar
        </Link>
      </p>
    );
  }

  return (
    <select
      value={selectedChildId ?? ""}
      onChange={(e) => setSelectedChildId(e.target.value)}
      className="px-4 py-2.5 border-2 border-surface-variant rounded-xl text-sm bg-white min-h-[44px] font-semibold focus:border-primary focus:outline-none"
      aria-label="Farzand tanlash"
    >
      {user.children.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.age} yosh)
        </option>
      ))}
    </select>
  );
}
