"use client";

import { ChildShell } from "@/components/child/ChildShell";
import { FigureCard } from "@/components/child/FigureCard";
import { FIGURE_CATALOG } from "@/lib/rag/figuresCatalog";
import { useChildSession } from "@/lib/child/ChildProvider";
import { t } from "@/lib/child/i18n";

export default function FiguresListPage() {
  const { profile } = useChildSession();

  return (
    <ChildShell
      title={t("figures", profile.language)}
      subtitle={t("pickFigureHint", profile.language)}
    >
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-primary tracking-tight">
            {t("pickFigure", profile.language)}
          </h2>
          <p className="text-sm text-outline font-medium mt-1">
            {profile.language === "uz"
              ? "Mentor tanlang va AI Arena'da suhbat boshlang"
              : "Выберите наставника и начните диалог в AI Arena"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {FIGURE_CATALOG.map((figure) => (
            <FigureCard key={figure.slug} figure={figure} language={profile.language} />
          ))}
        </div>
      </div>
    </ChildShell>
  );
}
