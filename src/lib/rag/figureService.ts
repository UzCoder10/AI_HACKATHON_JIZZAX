import { askAlloma } from "./askAlloma";
import type { SendFigureMessageParams, SendFigureMessageResult } from "@/types/figures";

/**
 * Buyuk Siymolar chat — askAlloma ustiga qisqa wrapper (slug orqali).
 */
export async function sendFigureMessage(
  params: SendFigureMessageParams
): Promise<SendFigureMessageResult> {
  const result = await askAlloma({
    allomaId: params.slug,
    question: params.message,
    sessionId: params.conversationId,
    childId: params.childId,
    age: params.age,
    name: params.name,
    language: params.language,
  });

  return {
    conversationId: result.sessionId,
    figureSlug: result.slug,
    figureName: result.figureName,
    reply: result.reply,
    filtered: result.filtered,
    crisis: result.crisis,
    grounded: result.grounded,
    sources: result.sources,
  };
}
