"use client";

import Link from "next/link";
import { useState } from "react";
import { useParentSession } from "@/lib/parent/ParentProvider";
import { NurtureSidebar } from "@/components/parent/nurture/NurtureSidebar";
import { NurtureTopbar } from "@/components/parent/nurture/NurtureTopbar";
import { PARENT_ROUTES } from "@/lib/parent/routes";

/**
 * Eski ParentShell — endi Nurture vizual qatlamidan foydalanadi.
 * ParentProvider va sahifa mantiqini o'zgartirmaydi.
 */
export function ParentShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <NurtureSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="md:ml-64">
        <NurtureTopbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {subtitle && (
            <p className="mb-6 text-base font-medium text-[#777587]">{subtitle}</p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function ChildSelector() {
  const { user, selectedChildId, setSelectedChildId } = useParentSession();

  if (!user?.children.length) {
    return (
      <p className="rounded-xl border border-[#ffdbca]/60 bg-[#ffdbca]/30 px-4 py-3 text-sm font-semibold text-[#783200]">
        Avval bola profili qo&apos;shing →{" "}
        <Link href={PARENT_ROUTES.children} className="font-bold text-[#3525cd] underline">
          Bolalar
        </Link>
      </p>
    );
  }

  return (
    <select
      value={selectedChildId ?? ""}
      onChange={(e) => setSelectedChildId(e.target.value)}
      className="min-h-[44px] rounded-xl border-2 border-[#c7c4d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#111c2d] focus:border-[#3525cd] focus:outline-none"
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

export { NurtureSidebar as ParentSidebar };
