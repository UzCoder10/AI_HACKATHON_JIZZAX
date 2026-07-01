import { redirect } from "next/navigation";
import { getFigureFromCatalog } from "@/lib/rag/figuresCatalog";
import { CHILD_ROUTES } from "@/lib/child/routes";

/** Eski mentor chat — Aqlli talk + figure query */
export default async function LegacyFigureChatRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const figure = getFigureFromCatalog(slug);
  if (!figure) {
    redirect(CHILD_ROUTES.talk);
  }
  redirect(CHILD_ROUTES.talkWithFigure(slug));
}
