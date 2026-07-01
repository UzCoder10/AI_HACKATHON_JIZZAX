import type { SafetyCategory } from "@/types/safety";

export interface PatternRule {
  pattern: RegExp;
  category: SafetyCategory;
  crisis: boolean;
}

/** Aniq xavfli — darhol bloklash */
export const BLOCK_PATTERNS: PatternRule[] = [
  // Zo'ravonlik
  { pattern: /o['']?ldir|убить|kill\s*(someone|my|him|her)/i, category: "violence", crisis: false },
  { pattern: /qanday\s*qilib\s*(o['']?g['']?irla|yashir)|how\s*to\s*(steal|make\s*a\s*bomb)|как\s*(укра|сделать\s*бомбу)/i, category: "violence", crisis: false },
  { pattern: /qurol|bomba|weapon|gun|оружие/i, category: "violence", crisis: false },

  // Kattalarga oid
  { pattern: /jinsiy|sexual|porn|порн|секс|seks/i, category: "adult", crisis: false },
  { pattern: /yalang['']?och|naked|nude|голый/i, category: "adult", crisis: false },

  // Shaxsiy ma'lumot
  { pattern: /parol|password|pin\s*code|пароль/i, category: "personal_info", crisis: false },
  { pattern: /telefon\s*raqam|phone\s*number|номер\s*телеф/i, category: "personal_info", crisis: false },
  { pattern: /uy\s*manzil|manzilim|where\s*do\s*you\s*live|где\s*ты\s*жив/i, category: "personal_info", crisis: false },

  // Companion / tashxis (chiqish uchun ham)
  { pattern: /men\s*sening\s*do['']?stingman|я\s*твой\s*друг/i, category: "companion", crisis: false },
  { pattern: /tashxis|diagnosis|диагноз|depressiya\s*tashxisi/i, category: "diagnosis", crisis: false },
];

/** Inqiroz — crisisHandler ishga tushadi */
export const CRISIS_PATTERNS: PatternRule[] = [
  { pattern: /o['']?zimni\s*o['']?ldir|o['']?z\s*jonimga\s*qasd|suicide|самоубий|хочу\s*умер/i, category: "self_harm", crisis: true },
  { pattern: /o['']?zimni\s*jarohat|self[\s-]?harm|порезать\s*себя|режу\s*себя/i, category: "self_harm", crisis: true },
  { pattern: /meni\s*urish|meni\s*bezor|molest|zo['']?rla|abus|насил|бьют\s*меня/i, category: "abuse", crisis: true },
  { pattern: /juda\s*qo['']?rqaman|qo['']?rqitishyapti|meni\s*qo['']?rqit|I'm\s*scared|боюсь|запуги/i, category: "fear", crisis: true },
];

/** Shubhali — LLM moderatsiya yoki bloklash */
export const SUSPICIOUS_PATTERNS: PatternRule[] = [
  /** Shubhali — LLM moderatsiya yoki bloklash (o'lim=death; olim=scholar emas) */
  { pattern: /\bo['']lim\b|\bölüm\b|\bdeath\b|смерть/i, category: "violence", crisis: false },
  { pattern: /yolg['']?iz|yolg['']?on|alcohol|spirt|alkogol|наркот|drug/i, category: "inappropriate", crisis: false },
  { pattern: /yolg['']?on\s*sevgi|love\s*you\s*ai|seni\s*sevaman/i, category: "companion", crisis: false },
  { pattern: /o['']?zimni\s*yomon\s*his|yolg['']?iz|грустно|плохо\s*себе/i, category: "fear", crisis: false },
];

export const MAX_INPUT_LENGTH = 2000;
export const MAX_OUTPUT_LENGTH = 4000;

/** Xabar matnidan qisqa xavfsiz xulosa (to'liq matn saqlanmaydi) */
export function summarizeForLog(text: string, maxLen = 80): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}…`;
}
