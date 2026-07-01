import type { AppLanguage } from "@/types/safety";
import {
  getNoSourceReply,
  buildAllomaSystemPrompt,
  getPersonaBySlug,
  type AllomaPersona,
} from "./personas";

export { getNoSourceReply };

export interface FigurePersonaContext {
  figureName: string;
  field: string;
  personaPrompt: string;
  language: AppLanguage;
  age: number;
  ragContext: string;
  question: string;
}

/** @deprecated personas/buildAllomaSystemPrompt dan foydalaning */
export function buildFigureSystemPrompt(ctx: FigurePersonaContext): string {
  const persona: AllomaPersona = getPersonaBySlug("abu-rayhon-beruniy") ?? {
    slug: "unknown",
    shortId: "unknown",
    nameUz: ctx.figureName,
    nameRu: ctx.figureName,
    field: ctx.field,
    era: "",
    systemPersona: ctx.personaPrompt,
    voiceStyle: "",
    offTopicGuidance: "",
  };

  return buildAllomaSystemPrompt({
    persona,
    language: ctx.language,
    age: ctx.age,
    ragContext: ctx.ragContext,
  });
}
