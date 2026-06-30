"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { ChildShell } from "@/components/child/ChildShell";
import { ChatWindow } from "@/components/child/ChatWindow";
import { getFigureFromCatalog } from "@/lib/rag/figuresCatalog";
import { FIGURE_EMOJIS } from "@/types/childUI";
import { useChildSession } from "@/lib/child/ChildProvider";

export default function FigureChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { profile } = useChildSession();
  const figure = getFigureFromCatalog(slug);

  if (!figure) notFound();

  const name = profile.language === "uz" ? figure.nameUz : figure.nameRu;
  const emoji = FIGURE_EMOJIS[slug] ?? "🌟";

  return (
    <ChildShell title={name} subtitle={figure.field} fullWidth>
      <ChatWindow
        mode="figure"
        figureSlug={slug}
        figureName={name}
        headerEmoji={emoji}
      />
    </ChildShell>
  );
}
