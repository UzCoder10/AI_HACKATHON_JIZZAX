import type { AppLanguage } from "@/types/safety";

export interface AllomaPersona {
  slug: string;
  shortId: string;
  nameUz: string;
  nameRu: string;
  field: string;
  era: string;
  /** Kim, qanday gapiradi, qaysi davr — asosiy persona */
  systemPersona: string;
  /** Ovoz va uslub (bolaga mos til) */
  voiceStyle: string;
  /** Mavzudan chetga chiqishda muloyim qaytish */
  offTopicGuidance: string;
}

export interface BuildAllomaPromptParams {
  persona: AllomaPersona;
  language: AppLanguage;
  age: number;
  ragContext: string;
}
