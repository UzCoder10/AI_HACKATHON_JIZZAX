"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { AdminRole } from "@/lib/admin/types";
import { CURRENT_ADMIN } from "@/lib/admin/mockData";

interface AdminContextValue {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
  adminName: string;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AdminRole>(CURRENT_ADMIN.role);

  const value = useMemo(
    () => ({ role, setRole, adminName: CURRENT_ADMIN.name }),
    [role]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminSession AdminProvider ichida ishlatilishi kerak");
  return ctx;
}
