import { filterChildInput, filterAiOutput } from "@/lib/safety";
import { getFallbackMessage } from "@/lib/safety/fallbacks";
import {
  getGreatFigureBySlug,
  getOrCreateFigureConversation,
  getConversationMessages,
  saveConversationMessage,
} from "@/lib/db/queries";
import { getAllomaContext } from "./allomaContext";
import { resolveAllomaSlug } from "./allomaIds";
import {
  getPersonaBySlug,
  buildAllomaSystemPrompt,
  getNoSourceReply,
} from "./personas";
import { clientFor, getClient, isAnthropicConfigured } from "@/lib/llm";
import type { ChatMessage } from "@/types/chat";
import type { AppLanguage } from "@/types/safety";
import type { AskAllomaParams, AskAllomaResult, ConversationTurn } from "@/types/alloma";

const HISTORY_LIMIT = 10;
const DEFAULT_AGE = 10;
const DEFAULT_LANGUAGE: AppLanguage = "uz";

function allomaLlmClient() {
  if (isAnthropicConfigured()) return getClient("anthropic");
  return clientFor("text");
}

async function persistMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  filtered: boolean
): Promise<void> {
  try {
    await saveConversationMessage(sessionId, role, content, filtered);
  } catch (error) {
    console.error("[askAlloma] DB yozishda xatolik:", error);
  }
}

async function resolveHistory(
  sessionId: string,
  explicitHistory?: ConversationTurn[]
): Promise<ConversationTurn[]> {
  if (explicitHistory && explicitHistory.length > 0) {
    return explicitHistory.slice(-HISTORY_LIMIT);
  }

  try {
    const dbMessages = await getConversationMessages(sessionId, HISTORY_LIMIT);
    return dbMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
  } catch {
    return [];
  }
}

async function generateAllomaReply(params: {
  systemPrompt: string;
  question: string;
  sessionId: string;
  language: AppLanguage;
  conversationHistory?: ConversationTurn[];
}): Promise<string> {
  const history = await resolveHistory(params.sessionId, params.conversationHistory);

  // DB dan yuklanganda joriy savol allaqachon saqlangan bo'lishi mumkin
  let priorTurns = history;
  const last = history[history.length - 1];
  if (
    last?.role === "user" &&
    last.content.trim() === params.question.trim()
  ) {
    priorTurns = history.slice(0, -1);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: params.systemPrompt },
    ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
    { role: "user", content: params.question },
  ];

  const completion = await allomaLlmClient().generateChatCompletion(messages, {
    temperature: 0.4,
    maxTokens: 800,
    language: params.language,
  });

  return completion.content;
}

/**
 * Alloma bilan suhbat — RAGFlow kontekst + persona + Claude (yoki mavjud LLM).
 * AI javob generatsiya qiladi, lekin faqat manba kontekstiga asoslangan.
 */
export async function askAlloma(params: AskAllomaParams): Promise<AskAllomaResult> {
  const {
    allomaId,
    question,
    conversationHistory,
    sessionId: reqSessionId,
    childId = "anonymous",
    age = DEFAULT_AGE,
    name = "",
    language = DEFAULT_LANGUAGE,
  } = params;

  const trimmed = question.trim();
  const slug = resolveAllomaSlug(allomaId);

  if (!slug) {
    throw new Error(`Noma'lum alloma: "${allomaId}"`);
  }

  const persona = getPersonaBySlug(slug);
  if (!persona) {
    throw new Error(`Persona topilmadi: ${slug}`);
  }

  const figure = await getGreatFigureBySlug(slug);
  const figureName = language === "uz" ? persona.nameUz : persona.nameRu;

  let sessionId = reqSessionId ?? `local-alloma-${childId}-${slug}`;

  try {
    const dbFigureId = figure?.id.startsWith("catalog-") ? undefined : figure?.id;
    const conversation = await getOrCreateFigureConversation({
      conversationId: reqSessionId,
      childId,
      childName: name,
      childAge: age,
      language,
      figureId: dbFigureId,
      figureSlug: slug,
    });
    sessionId = conversation.id;
  } catch (error) {
    console.error("[askAlloma] Conversation xatolik:", error);
  }

  await persistMessage(sessionId, "user", trimmed, false);

  const inputCheck = await filterChildInput({
    text: trimmed,
    age,
    language,
    childId,
    sessionId,
  });

  if (!inputCheck.allowed) {
    await persistMessage(sessionId, "assistant", inputCheck.content, true);
    return {
      allomaId,
      slug,
      figureName,
      reply: inputCheck.content,
      sessionId,
      filtered: true,
      crisis: inputCheck.crisis,
      grounded: false,
      sources: [],
    };
  }

  const allomaCtx = await getAllomaContext(allomaId, trimmed);

  if (allomaCtx.error) {
    console.error("[askAlloma] RAGFlow:", allomaCtx.error);
  }

  if (!allomaCtx.found || !allomaCtx.context) {
    const noSourceReply = getNoSourceReply(figureName, language);
    await persistMessage(sessionId, "assistant", noSourceReply, false);
    return {
      allomaId,
      slug,
      figureName,
      reply: noSourceReply,
      sessionId,
      filtered: false,
      crisis: false,
      grounded: true,
      sources: [],
      ragError: allomaCtx.error,
    };
  }

  const systemPrompt = buildAllomaSystemPrompt({
    persona,
    language,
    age,
    ragContext: allomaCtx.context,
  });

  let rawReply: string;
  try {
    rawReply = await generateAllomaReply({
      systemPrompt,
      question: trimmed,
      sessionId,
      language,
      conversationHistory,
    });
  } catch (error) {
    console.error("[askAlloma] LLM xatolik:", error);
    rawReply = getFallbackMessage("output_blocked", language);
  }

  // #region agent log
  fetch("http://127.0.0.1:7540/ingest/b8884068-3b45-4557-b9a6-1fb2efe1233e", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e74b4" },
    body: JSON.stringify({
      sessionId: "9e74b4",
      hypothesisId: "H6",
      location: "askAlloma.ts:beforeOutputFilter",
      message: "LLM raw reply before output filter",
      data: {
        allomaId,
        rawLen: rawReply.length,
        rawPreview: rawReply.slice(0, 200),
        isFallback: rawReply.includes("javob bera olmayman"),
      },
      timestamp: Date.now(),
      runId: "post-fix-filter",
    }),
  }).catch(() => {});
  // #endregion

  const outputCheck = await filterAiOutput({
    text: rawReply,
    age,
    language,
    childId,
    sessionId,
  });

  const finalReply = outputCheck.content;
  const filtered = !outputCheck.allowed;

  // #region agent log
  fetch("http://127.0.0.1:7540/ingest/b8884068-3b45-4557-b9a6-1fb2efe1233e", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e74b4" },
    body: JSON.stringify({
      sessionId: "9e74b4",
      hypothesisId: "H6",
      location: "askAlloma.ts:afterOutputFilter",
      message: "Output filter result",
      data: {
        allomaId,
        filtered,
        category: outputCheck.category,
        eventLogged: outputCheck.eventLogged,
        finalPreview: finalReply.slice(0, 120),
      },
      timestamp: Date.now(),
      runId: "post-fix-filter",
    }),
  }).catch(() => {});
  // #endregion

  await persistMessage(sessionId, "assistant", finalReply, filtered);

  return {
    allomaId,
    slug,
    figureName,
    reply: finalReply,
    sessionId,
    filtered,
    crisis: false,
    grounded: true,
    sources: allomaCtx.sources,
  };
}

/** snake_case alias */
export const ask_alloma = askAlloma;
