"use client";

import Link from "next/link";
import Image from "next/image";
import type { FigureCatalogEntry } from "@/lib/rag/figuresCatalog";
import type { ChildLanguage } from "@/types/childUI";
import { FIGURE_EMOJIS } from "@/types/childUI";
import { getFigureAccent, getFigureAvatar } from "@/lib/design/avatars";

interface FigureCardProps {
  figure: FigureCatalogEntry;
  language: ChildLanguage;
}

export function FigureCard({ figure, language }: FigureCardProps) {
  const name = language === "uz" ? figure.nameUz : figure.nameRu;
  const emoji = FIGURE_EMOJIS[figure.slug] ?? "🌟";
  const accent = getFigureAccent(figure.slug);
  const avatar = getFigureAvatar(figure.slug);

  return (
    <Link
      href={`/figures/${figure.slug}`}
      className={`block bg-white rounded-[24px] p-5 border border-surface-container-low ${accent.shadow} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group min-h-[120px]`}
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${accent.bar}`} />
      <div className="flex items-center gap-4 mt-1">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-surface-container-low border border-surface-variant">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-3xl">{emoji}</span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight">
            {name}
          </h3>
          <p className={`text-[10px] font-extrabold uppercase tracking-widest mt-1 ${accent.badge}`}>
            {figure.field}
          </p>
          <p className="text-xs text-outline mt-0.5">{figure.era}</p>
        </div>
      </div>
    </Link>
  );
}
