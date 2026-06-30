import { createChatCompletion } from "./alemClient";
import { buildChildChatSystemPrompt, buildChatMessages } from "./systemPrompts";
import { filterChildInput, filterAiOutput } from "@/lib/safety";
import { getFallbackMessage } from "@/lib/safety/fallbacks";
import {
  getOrCreateConversation,
  getConversationMessages,
  saveConversationMessage,
} from "@/lib/db/queries";
import type { SendMessageParams, SendMessageResult } from "@/types/chat";

const HISTORY_LIMIT = 20;

async function persistMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  filtered: boolean
): Promise<void> {
  try {
    await saveConversationMessage(conversationId, role, content, filtered);
  } catch (error) {
    console.error("[chatService] DB yozishda xatolik:", error);
  }
}

async function ensureConversation(params: SendMessageParams): Promise<string | null> {
  try {
    const conversation = await getOrCreateConversation({
      conversationId: params.conversationId,
      childId: params.childId,
      childName: params.name,
      childAge: params.age,
      language: params.language,
    });
    return conversation.id;
  } catch (error) {
    console.error("[chatService] Conversation yaratishda xatolik:", error);
    return params.conversationId ?? null;
  }
}

/**
 * To'liq suhbat oqimi — HAR BIR javob xavfsizlik qatlamidan o'tadi.
 * Filtrsiz LLM javobi hech qachon qaytarilmaydi.
 */
export async function sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
  const { childId, message, age, name, language, conversationId: reqConversationId } = params;
  const trimmed = message.trim();

  const conversationId =
    (await ensureConversation(params)) ?? reqConversationId ?? `local-${childId}`;

  // a) Foydalanuvchi xabarini saqlash
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
      reply: inputCheck.content,
      filtered: true,
      crisis: inputCheck.crisis,
    };
  }

  // c) ALEMLLM ga xavfsiz yuborish
  let rawAiReply: string;
  try {
    const systemPrompt = buildChildChatSystemPrompt({ age, language, name });
    let history: Array<{ role: "user" | "assistant"; content: string }> = [];

    try {
      const dbMessages = await getConversationMessages(conversationId, HISTORY_LIMIT);
      history = dbMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(0, -1) // oxirgi user xabari alohida qo'shiladi
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
    } catch {
      // tarix bo'lmasa — bo'sh bilan davom
    }

    const messages = buildChatMessages(systemPrompt, history, trimmed);
    const completion = await createChatCompletion(messages, {}, language);
    rawAiReply = completion.content;
  } catch (error) {
    console.error("[chatService] LLM xatolik:", error);
    rawAiReply = getFallbackMessage("output_blocked", language);
  }

  // d) Chiqish filtri — MAJBURIY
  const outputCheck = await filterAiOutput({
    text: rawAiReply,
    age,
    language,
    childId,
    sessionId: conversationId,
  });

  const finalReply = outputCheck.content;
  const filtered = !outputCheck.allowed || rawAiReply !== finalReply;

  // e) Javobni DB ga yozish
  await persistMessage(conversationId, "assistant", finalReply, filtered);

  // f) Tozalangan javob
  return {
    conversationId,
    reply: finalReply,
    filtered,
    crisis: false,
  };
}

export { createChatCompletion, createChatCompletionStream } from "./alemClient";
export { buildChildChatSystemPrompt } from "./systemPrompts";
