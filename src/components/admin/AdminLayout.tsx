"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { BRAND } from "@/lib/brand";

const TITLES: Record<string, string> = {
  "/admin": `${BRAND.name} Admin`,
  "/admin/users": "Foydalanuvchilar",
  "/admin/children": "Bola akkauntlari",
  "/admin/content": "Kontent boshqaruvi",
  "/admin/ai": "AI nazorati",
  "/admin/billing": "Obuna va to'lovlar",
  "/admin/settings": "Sozlamalar va rollar",
};

function titleFromPath(pathname: string): string {
  if (pathname.startsWith("/admin/users/")) return "Foydalanuvchi profili";
  return TITLES[pathname] ?? "Admin Portal";
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-portal">
      <AdminSidebar />
      <main className="ml-[var(--admin-sidebar-width)] min-h-screen">
        <AdminTopbar title={titleFromPath(pathname)} />
        <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
