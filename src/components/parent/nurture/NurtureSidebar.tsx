"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { PARENT_NAV, PARENT_ROUTES } from "@/lib/parent/routes";
import { useParentSession } from "@/lib/parent/ParentProvider";
import { MaterialIcon } from "./MaterialIcon";

function isNavActive(
  pathname: string,
  href: string,
  matchPrefix?: string,
  matchPrefixes?: string[],
  exact?: boolean
): boolean {
  if (matchPrefixes?.length) return matchPrefixes.some((p) => pathname.startsWith(p));
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function NurtureSidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useParentSession();
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Ota-ona";

  const aside = (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#c7c4d8]/30 bg-white py-6 px-4 shadow-[0_4px_20px_rgba(30,41,59,0.05)] md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } transition-transform duration-300`}
    >
      <div className="mb-8 px-2">
        <Link href={PARENT_ROUTES.dashboard} onClick={onClose}>
          <h1 className="text-xl font-bold text-[#3525cd]">{BRAND.name}</h1>
          <p className="text-sm font-semibold text-[#777587] opacity-70">{BRAND.accountLabel}</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {PARENT_NAV.map(({ href, label, icon, matchPrefix, matchPrefixes, exact }) => {
          const active = isNavActive(pathname, href, matchPrefix, matchPrefixes, exact);
          const isSupport = href.startsWith("#");

          const className = `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            active
              ? "bg-[#4f46e5] text-[#dad7ff] scale-[0.98]"
              : "text-[#464555] hover:bg-[#dee8ff]"
          }`;

          if (isSupport) {
            return (
              <a
                key={label}
                href={`mailto:${BRAND.supportEmail}`}
                className={className.replace("scale-[0.98]", "")}
              >
                <MaterialIcon name={icon} className="group-hover:scale-110 transition-transform" />
                {label}
              </a>
            );
          }

          return (
            <Link key={href + label} href={href} className={className} onClick={onClose}>
              <MaterialIcon name={icon} filled={active} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-[#f0f3ff] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4f46e5]/30 bg-[#4f46e5]/10 text-sm font-bold text-[#4f46e5]">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#111c2d]">{displayName}</p>
          <p className="truncate text-[11px] text-[#777587]">{user?.email ?? "Toshkent, UZ"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => logout()}
        className="mt-3 w-full rounded-xl border border-red-100 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
      >
        Chiqish
      </button>
    </aside>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      {aside}
    </>
  );
}
