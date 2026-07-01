"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { NurtureSidebar } from "./NurtureSidebar";
import { NurtureTopbar } from "./NurtureTopbar";

function titleFromPath(pathname: string): string {
  if (pathname.startsWith("/dashboard/subscription")) return "Obuna va To'lovlar";
  if (pathname.startsWith("/dashboard/child/")) return "Bola profili";
  return "Dashboard";
}

type Props = {
  children: React.ReactNode;
  title?: string;
};

export function ParentDashboardLayout({ children, title }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = title ?? titleFromPath(pathname);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <NurtureSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="md:ml-64">
        <NurtureTopbar title={pageTitle} onMenuClick={() => setMobileOpen(true)} />
        <div className="pb-12">{children}</div>
      </div>
    </div>
  );
}
