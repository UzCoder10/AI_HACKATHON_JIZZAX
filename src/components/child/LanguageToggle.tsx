"use client";

import { useChildSession } from "@/lib/child/ChildProvider";
import type { ChildLanguage } from "@/types/childUI";

export function LanguageToggle() {
  const { profile, setLanguage } = useChildSession();

  const btn = (lang: ChildLanguage, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(lang)}
      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all min-h-[36px] min-w-[44px] ${
        profile.language === lang
          ? "bg-primary text-on-primary shadow-btn-primary"
          : "bg-surface-container text-primary border border-surface-variant hover:bg-primary/10"
      }`}
      aria-pressed={profile.language === lang}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-1.5" role="group" aria-label="Til tanlash">
      {btn("uz", "O'zb")}
      {btn("ru", "Рус")}
    </div>
  );
}
