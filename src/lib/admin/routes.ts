import type { AdminRole } from "@/lib/admin/types";

export const ADMIN_ROUTES = {
  overview: "/admin",
  users: "/admin/users",
  userDetail: (id: string) => `/admin/users/${id}`,
  children: "/admin/children",
  content: "/admin/content",
  ai: "/admin/ai",
  billing: "/admin/billing",
  settings: "/admin/settings",
} as const;

export type AdminNavKey =
  | "overview"
  | "users"
  | "children"
  | "content"
  | "ai"
  | "billing"
  | "settings";

export interface AdminNavItem {
  key: AdminNavKey;
  href: string;
  label: string;
  icon: string;
  roles: AdminRole[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "overview", href: ADMIN_ROUTES.overview, label: "Umumiy ko'rinish", icon: "dashboard", roles: ["super-admin", "content-manager", "moderator"] },
  { key: "users", href: ADMIN_ROUTES.users, label: "Foydalanuvchilar", icon: "group", roles: ["super-admin", "moderator"] },
  { key: "children", href: ADMIN_ROUTES.children, label: "Bola akkauntlari", icon: "child_care", roles: ["super-admin", "moderator"] },
  { key: "content", href: ADMIN_ROUTES.content, label: "Kontent", icon: "library_books", roles: ["super-admin", "content-manager"] },
  { key: "ai", href: ADMIN_ROUTES.ai, label: "AI nazorati", icon: "shield_lock", roles: ["super-admin", "moderator"] },
  { key: "billing", href: ADMIN_ROUTES.billing, label: "Obuna va to'lovlar", icon: "payments", roles: ["super-admin"] },
  { key: "settings", href: ADMIN_ROUTES.settings, label: "Sozlamalar", icon: "settings", roles: ["super-admin"] },
];

export function navForRole(role: AdminRole): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => item.roles.includes(role));
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  "super-admin": "Super-admin",
  "content-manager": "Kontent-menejer",
  moderator: "Moderator",
};
