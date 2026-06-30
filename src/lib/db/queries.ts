import { prisma } from "./client";
import { getFigureFromCatalog } from "@/lib/rag/figuresCatalog";

export async function getGreatFigureBySlug(slug: string) {
  try {
    const fromDb = await prisma.greatFigure.findFirst({
      where: { slug, isActive: true },
    });
    if (fromDb) return fromDb;
  } catch (error) {
    console.error("[getGreatFigureBySlug] DB xatolik, katalog fallback:", error);
  }

  const catalog = getFigureFromCatalog(slug);
  if (!catalog) return null;

  // DB yo'q bo'lganda katalogdan pseudo-record
  return {
    id: `catalog-${catalog.slug}`,
    slug: catalog.slug,
    nameUz: catalog.nameUz,
    nameRu: catalog.nameRu,
    field: catalog.field,
    era: catalog.era,
    personaPrompt: catalog.personaPrompt,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function listGreatFigures() {
  return prisma.greatFigure.findMany({
    where: { isActive: true },
    orderBy: { nameUz: "asc" },
  });
}

export async function getOrCreateConversation(params: {
  conversationId?: string;
  childId: string;
  childName: string;
  childAge: number;
  language: string;
}) {
  if (params.conversationId) {
    const existing = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        childId: params.childId,
        status: "ACTIVE",
        mode: "STANDARD",
      },
    });
    if (existing) return existing;
  }

  return prisma.conversation.create({
    data: {
      childId: params.childId,
      childName: params.childName,
      childAge: params.childAge,
      language: params.language,
      mode: "STANDARD",
    },
  });
}

export async function getOrCreateFigureConversation(params: {
  conversationId?: string;
  childId: string;
  childName: string;
  childAge: number;
  language: string;
  figureId?: string;
  figureSlug: string;
}) {
  const figureFilter = params.figureId
    ? { figureId: params.figureId }
    : { figure: { slug: params.figureSlug } };

  if (params.conversationId) {
    const existing = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        childId: params.childId,
        status: "ACTIVE",
        mode: "GREAT_FIGURE",
        ...figureFilter,
      },
    });
    if (existing) return existing;
  }

  return prisma.conversation.create({
    data: {
      childId: params.childId,
      childName: params.childName,
      childAge: params.childAge,
      language: params.language,
      mode: "GREAT_FIGURE",
      figureId: params.figureId,
    },
  });
}

export async function getConversationMessages(conversationId: string, limit = 20) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function saveConversationMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  filtered = false
) {
  const message = await prisma.message.create({
    data: { conversationId, role, content, filtered },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}
