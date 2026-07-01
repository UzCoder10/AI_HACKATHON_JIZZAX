"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CHILD_ROUTES, type ChildNavTab } from "@/lib/child/routes";
import { AqlliIcon } from "./AqlliIcon";

const TABS: Array<{ tab: ChildNavTab; href: string; icon: string; label: string }> = [
  { tab: "lessons", href: CHILD_ROUTES.home, icon: "menu_book", label: "Darslar" },
  { tab: "talk", href: CHILD_ROUTES.talk, icon: "mic", label: "Suhbat" },
  { tab: "achievements", href: CHILD_ROUTES.achievements, icon: "emoji_events", label: "Yutuqlar" },
  { tab: "profile", href: CHILD_ROUTES.achievements, icon: "person", label: "Profil" },
];

function activeTab(pathname: string): ChildNavTab {
  if (pathname.startsWith("/child/talk")) return "talk";
  if (pathname.startsWith("/child/achievements")) return "achievements";
  if (pathname.startsWith("/child/lesson")) return "lessons";
  return "lessons";
}

export function ChildBottomNav() {
  const pathname = usePathname();
  const current = activeTab(pathname);

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 items-center justify-around rounded-t-3xl border-t border-[#ece8d9]/80 bg-[#fdf9e9]/95 px-4 pb-6 pt-3 shadow-[0_-8px_32px_rgba(112,93,0,0.08)] backdrop-blur-md"
      aria-label="Asosiy navigatsiya"
    >
      {TABS.map(({ tab, href, icon, label }) => {
        const active = current === tab || (tab === "profile" && current === "achievements");
        return (
          <Link
            key={tab}
            href={href}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              active
                ? "rounded-full bg-[#ffd93d] px-5 py-2 text-[#725e00]"
                : "p-2 text-[#4d4633] hover:bg-[#ece8d9]"
            }`}
          >
            <AqlliIcon name={icon} filled={active} size="sm" />
            <span className="mt-0.5 text-sm font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
