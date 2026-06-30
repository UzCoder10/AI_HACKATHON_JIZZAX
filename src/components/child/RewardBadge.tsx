"use client";

import { useChildSession } from "@/lib/child/ChildProvider";
import { t } from "@/lib/child/i18n";

export function RewardBadge() {
  const { profile, progress } = useChildSession();

  return (
    <div className="flex items-center gap-3 bg-white rounded-[24px] px-5 py-4 border border-surface-container-low shadow-vibrant-secondary">
      <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-2xl">
        ⭐
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">{t("stars", profile.language)}</p>
          <p className="text-2xl font-black text-primary">{progress.stars}</p>
        </div>
        <div>
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">{t("level", profile.language)}</p>
          <p className="text-2xl font-black text-secondary">{progress.level}</p>
        </div>
      </div>
    </div>
  );
}
