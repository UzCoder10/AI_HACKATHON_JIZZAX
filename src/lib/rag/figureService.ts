import { createChatCompletion } from "@/lib/ai/alemClient";
import { filterChildInput, filterAiOutput } from "@/lib/safety";
import { getFallbackMessage } from "@/lib/safety/fallbacks";
import {
  getGreatFigureBySlug,
  getOrCreateFigureConversation,
  getConversationMessages,
  saveConversationMessage,
} from "@/lib/db/queries";
import {
  retrieveFromKnowledgeBase,
  buildRagContext,
  getSourceNames,
  isRagflowConfigured,
} from "./ragflowClient";
import { runFigureFlow, isLangflowConfigured } from "./langflowClient";
import {
  buildFigureSystemPrompt,
  buildFigureUserMessage,
  getNoSourceReply,
} from "./figurePersonas";
import type { SendFigureMessageParams, SendFigureMessageResult } from "@/types/figures";

const HISTORY_LIMIT = 10;

async function persistMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  filtered: boolean
): Promise<void> {
  try {
    await saveConversationMessage(conversationId, role, content, filtered);
  } catch (error) {
    console.error("[figureService] DB yozishda xatolik:", error);
  }
}

async function generateGroundedReply(params: {
  figureName: string;
  field: string;
  personaPrompt: string;
  question: string;
  ragContext: string;
  sources: string[];
  age: number;
  language: SendFigureMessageParams["language"];
  conversationId: string;
}): Promise<string> {
  const systemPrompt = buildFigureSystemPrompt({
    figureName: params.figureName,
    field: params.field,
    personaPrompt: params.personaPrompt,
    language: params.language,
    age: params.age,
    ragContext: params.ragContext,
    question: params.question,
  });

  // LangFlow birinchi ustuvorlik — flow: RAG kontekst + persona
  if (isLangflowConfigured()) {
    try {
      const flowResult = await runFigureFlow({
        question: params.question,
        ragContext: params.ragContext,
        figureName: params.figureName,
        personaPrompt: params.personaPrompt,
        language: params.language,
        age: params.age,
        sessionId: params.conversationId,
      });
      return flowResult.content;
    } catch (error) {
      console.error("[figureService] LangFlow xatolik, ALEMLLM fallback:", error);
    }
  }

  // Fallback: ALEMLLM + qattiq manba-kontekstli prompt
  let history: Array<{ role: "user" | "assistant"; content: string }> = [];
  try {
    const dbMessages = await getConversationMessages(params.conversationId, HISTORY_LIMIT);
    history = dbMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, -1)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
  } catch {
    // tarixsiz davom
  }

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history,
    { role: "user" as const, content: buildFigureUserMessage(params.question) },
  ];

  const completion = await createChatCompletion(messages, {}, params.language);
  return completion.content;
}

/**
 * Buyuk Siymolar to'liq oqimi — ta'limiy persona, RAG-asosli aniqlik.
 * HAR BIR javob xavfsizlik qatlamidan o'tadi.
 */
export async function sendFigureMessage(
  params: SendFigureMessageParams
): Promise<SendFigureMessageResult> {
  const { slug, childId, message, age, name, language, conversationId: reqConversationId } =
    params;
  const trimmed = message.trim();

  const figure = await getGreatFigureBySlug(slug);
  if (!figure) {
    throw new Error(`Shaxs topilmadi: ${slug}`);
  }

  const figureName = language === "uz" ? figure.nameUz : figure.nameRu;

  let conversationId = reqConversationId ?? `local-figure-${childId}-${slug}`;

  try {
    const dbFigureId = figure.id.startsWith("catalog-") ? undefined : figure.id;
    const conversation = await getOrCreateFigureConversation({
      conversationId: reqConversationId,
      childId,
      childName: name,
      childAge: age,
      language,
      figureId: dbFigureId,
      figureSlug: slug,
    });
    conversationId = conversation.id;
  } catch (error) {
    console.error("[figureService] Conversation xatolik:", error);
  }

  await persistMessage(conversationId, "user", trimmed, false);

  // b) Kirish filtri
  const inputCheck = await filterChildInput({
    text: trimmed,
    age,
    language,
    childId,
    sessionId: conversationId,
  });

  if (!inputCheck.allowed) {
    await persistMessage(conversationId, "assistant", inputCheck.content, true);
    return {
      conversationId,
      figureSlug: slug,
      figureName,
      reply: inputCheck.content,
      filtered: true,
      crisis: inputCheck.crisis,
      grounded: false,
      sources: [],
    };
  }

  // c) RAGFlow retrieval — aniqlik kafolati asosi
  let chunks: Awaited<ReturnType<typeof retrieveFromKnowledgeBase>>["chunks"] = [];
  let sources: string[] = [];

  if (isRagflowConfigured()) {
    try {
      const retrieval = await retrieveFromKnowledgeBase(trimmed, {
        figureKeyword: figureName,
      });
      chunks = retrieval.chunks;
      sources = getSourceNames(chunks);

      // f) Manba yo'q — LLM chaqirilmaydi, o'ylab topilmaydi
      if (!retrieval.hasRelevantContent) {
        const noSourceReply = getNoSourceReply(figureName, language);
        await persistMessage(conversationId, "assistant", noSourceReply, false);
        return {
          conversationId,
          figureSlug: slug,
          figureName,
          reply: noSourceReply,
          filtered: false,
          crisis: false,
          grounded: true,
          sources: [],
        };
      }
    } catch (error) {
      console.error("[figureService] RAGFlow xatolik:", error);
      const fallback = getNoSourceReply(figureName, language);
      await persistMessage(conversationId, "assistant", fallback, false);
      return {
        conversationId,
        figureSlug: slug,
        figureName,
        reply: fallback,
        filtered: false,
        crisis: false,
        grounded: false,
        sources: [],
      };
    }
  } else {
    // RAG sozlanmagan — xavfsizlik: javob uydurma qilinmaydi
    const noSourceReply = getNoSourceReply(figureName, language);
    await persistMessage(conversationId, "assistant", noSourceReply, false);
    return {
      conversationId,
      figureSlug: slug,
      figureName,
      reply: noSourceReply,
      filtered: false,
      crisis: false,
      grounded: false,
      sources: [],
    };
  }

  const ragContext = buildRagContext(chunks);

  // d) LangFlow yoki ALEMLLM + RAG kontekst
  let rawReply: string;
  try {
    rawReply = await generateGroundedReply({
      figureName,
      field: figure.field,
      personaPrompt: figure.personaPrompt,
      question: trimmed,
      ragContext,
      sources,
      age,
      language,
      conversationId,
    });
  } catch (error) {
    console.error("[figureService] Generatsiya xatolik:", error);
    rawReply = getFallbackMessage("output_blocked", language);
  }

  // e) Chiqish filtri — MAJBURIY
  const outputCheck = await filterAiOutput({
    text: rawReply,
    age,
    language,
    childId,
    sessionId: conversationId,
  });

  const finalReply = outputCheck.content;
  const filtered = !outputCheck.allowed;

  await persistMessage(conversationId, "assistant", finalReply, filtered);

  return {
    conversationId,
    figureSlug: slug,
    figureName,
    reply: finalReply,
    filtered,
    crisis: false,
    grounded: true,
    sources,
  };
}
