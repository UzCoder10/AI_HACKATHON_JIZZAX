/** Ota-ona paneli marshrutlari — navigatsiya va linklar uchun yagona manba */
export const PARENT_ROUTES = {
  login: "/login",
  register: "/register",
  pin: "/pin",
  dashboard: "/dashboard",
  child: (id: string) => `/dashboard/child/${id}`,
  subscription: "/dashboard/subscription",
  settings: "/settings",
  /** Eski sahifalar — keyingi bosqichlarda yangilanadi yoki birlashtiriladi */
  children: "/children",
  safety: "/safety",
  transparency: "/transparency",
} as const;

export type ParentNavItem = {
  href: string;
  label: string;
  icon: string;
  matchPrefix?: string;
  matchPrefixes?: string[];
  exact?: boolean;
};

export const PARENT_NAV: ParentNavItem[] = [
  { href: PARENT_ROUTES.dashboard, label: "Dashboard", icon: "dashboard", exact: true },
  {
    href: PARENT_ROUTES.children,
    label: "Bolalar",
    icon: "face",
    matchPrefixes: ["/children", "/dashboard/child"],
  },
  { href: PARENT_ROUTES.subscription, label: "Obuna", icon: "payments", matchPrefix: "/dashboard/subscription" },
  { href: PARENT_ROUTES.settings, label: "Sozlamalar", icon: "settings", matchPrefix: "/settings" },
  { href: "#support", label: "Yordam", icon: "contact_support" },
];
