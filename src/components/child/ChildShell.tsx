"use client";

import Link from "next/link";
import { useChildSession } from "@/lib/child/ChildProvider";
import { LanguageToggle } from "@/components/child/LanguageToggle";
import { ChildNav } from "@/components/child/ChildNav";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { t } from "@/lib/child/i18n";

export function ChildHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { profile, progress } = useChildSession();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-surface-variant shadow-soft-blue">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <BrandLogo href="/home" size="sm" />
          {(title || subtitle) && (
            <div className="mt-1 min-w-0">
              {title && (
                <Link href="/home" className="text-sm font-extrabold text-on-surface truncate block hover:text-primary">
                  {title}
                </Link>
              )}
              {subtitle && <p className="text-xs text-outline truncate">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end text-right">
            <p className="text-xs font-bold text-on-surface">{profile.name}</p>
            <p className="text-[10px] font-bold text-primary">
              ⭐ {progress.stars} · {t("level", profile.language)} {progress.level}
            </p>
          </div>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

export function ChildShell({
  children,
  title,
  subtitle,
  showNav = true,
  fullWidth = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showNav?: boolean;
  fullWidth?: boolean;
}) {
  const { profile } = useChildSession();

  return (
    <div className="min-h-screen bg-brand-bg pb-28 chat-pattern-bg">
      <ChildHeader
        title={title ?? t("appName", profile.language)}
        subtitle={subtitle ?? t("assistant", profile.language)}
      />
      <main className={`mx-auto px-4 py-4 ${fullWidth ? "max-w-5xl" : "max-w-3xl"}`}>{children}</main>
      {showNav && <ChildNav />}
    </div>
  );
}
