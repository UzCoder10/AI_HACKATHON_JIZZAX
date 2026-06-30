"use client";

import Link from "next/link";
import { ChildShell } from "@/components/child/ChildShell";
import { RewardBadge } from "@/components/child/RewardBadge";
import { MoodPicker } from "@/components/child/MoodPicker";
import { DailyTaskCard } from "@/components/child/DailyTaskCard";
import { useChildSession } from "@/lib/child/ChildProvider";
import { t } from "@/lib/child/i18n";

export default function ChildHomePage() {
  const { profile } = useChildSession();

  return (
    <ChildShell>
      <div className="space-y-5">
        <div className="bg-white rounded-[32px] p-6 shadow-vibrant-primary border border-surface-container-low relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 py-1 px-3 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[10px] mb-3">
              ✨ {t("welcome", profile.language)}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">
              {profile.name}! 👋
            </h1>
            <p className="text-outline mt-2 text-sm font-medium">
              {profile.language === "uz"
                ? "Bugun nima o'rganamiz?"
                : "Чему научимся сегодня?"}
            </p>
          </div>
        </div>

        <RewardBadge />
        <MoodPicker />
        <DailyTaskCard />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/figures"
            className="flex flex-col items-center justify-center gap-2 bg-primary text-on-primary rounded-[24px] p-6 min-h-[120px] font-extrabold text-sm shadow-btn-primary hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] transition-all"
          >
            <span className="text-4xl">🌟</span>
            {t("goFigures", profile.language)}
          </Link>
          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-2 bg-white text-primary border-2 border-primary/20 rounded-[24px] p-6 min-h-[120px] font-extrabold text-sm shadow-vibrant-primary hover:border-primary active:scale-[0.98] transition-all"
          >
            <span className="text-4xl">💬</span>
            {t("goChat", profile.language)}
          </Link>
        </div>
      </div>
    </ChildShell>
  );
}
