"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChildSession } from "@/lib/child/ChildProvider";
import { t } from "@/lib/child/i18n";

const NAV = [
  { href: "/home", icon: "🏠", key: "home" as const },
  { href: "/figures", icon: "🌟", key: "figures" as const },
  { href: "/chat", icon: "💬", key: "chat" as const },
];

export function ChildNav() {
  const pathname = usePathname();
  const { profile } = useChildSession();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-xl z-50 flex justify-around items-center p-2 bg-white/80 backdrop-blur-lg rounded-full shadow-heavy-blue border border-white/50 safe-area-pb">
      {NAV.map(({ href, icon, key }) => {
        const active =
          pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center rounded-full transition-all min-w-[64px] ${
              active
                ? "bg-primary text-on-primary px-5 py-2.5 shadow-md shadow-primary/20 font-bold scale-105"
                : "text-outline hover:text-primary px-4 py-2 font-semibold"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {icon}
            </span>
            <span className="text-[10px] mt-0.5 uppercase tracking-wide">{t(key, profile.language)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
