import { createChatCompletion } from "@/lib/ai/alemClient";
import { FIGURE_CATALOG } from "@/lib/rag/figuresCatalog";
import type {
  ExtractedInterest,
  InterestExtractionResult,
} from "@/types/insights";
import type { AppLanguage } from "@/types/safety";

/** Shaxs slug -> qiziqish mavzusi mapping (qoidaviy) */
const FIGURE_INTEREST_MAP: Record<string, { topic: string; topicRu: string }> = {
  "mirzo-ulugbek": { topic: "astronomiya va kosmos", topicRu: "астрономия и космос" },
  "abu-rayhon-beruniy": { topic: "geografiya va ilm", topicRu: "география и наука" },
  "ibn-sino": { topic: "tibbiyot va sog'liq", topicRu: "медицина и здоровье" },
  "alisher-navoiy": { topic: "adabiyot va she'riyat", topicRu: "литература и поэзия" },
  "al-xorazmiy": { topic: "matematika va mantiq", topicRu: "математика и логика" },
  "amir-temur": { topic: "tarix va madaniyat", topicRu: "история и культура" },
  "imom-al-buxoriy": { topic: "diniy ilm va axloq", topicRu: "религиозное знание и этика" },
};

interface ConversationStats {
  figureCounts: Map<string, { name: string; count: number }>;
  standardMessages: number;
  keywordHints: string[];
  hours: number[];
}

const TOPIC_KEYWORDS: Array<{ pattern: RegExp; topic: string }> = [
  { pattern: /yulduz|sayyora|kosmos|osmon|planeta|oy\b/i, topic: "astronomiya" },
  { pattern: /matemat|hisob|raqam|algebra/i, topic: "matematika" },
  { pattern: /kitob|she'r|adabiyot|hikoya/i, topic: "adabiyot" },
  { pattern: /tarix|qadim|asr|xalqa/i, topic: "tarix" },
  { pattern: /hayvon|tabiat|o'simlik/i, topic: "tabiat" },
  { pattern: /sport|futbol|o'yin/i, topic: "sport" },
  { pattern: /musiqa|raqs|san'at/i, topic: "san'at" },
  { pattern: /maktab|dars|o'qituvchi/i, topic: "maktab" },
  { pattern: /do'st|o'yin/i, topic: "ijtimoiy munosabatlar" },
];

function extractKeywordTopics(text: string): string[] {
  const topics = new Set<string>();
  for (const { pattern, topic } of TOPIC_KEYWORDS) {
    if (pattern.test(text)) topics.add(topic);
  }
  return [...topics];
}

/** Suhbat metadata — ota-onaga so'zma-so'z matn yuborilmaydi */
function buildStatsFromMessages(
  messages: Array<{
    content: string;
    createdAt: Date;
    conversation: {
      mode: string;
      figure: { slug: string; nameUz: string; field: string } | null;
    };
  }>
): ConversationStats {
  const figureCounts = new Map<string, { name: string; count: number }>();
  let standardMessages = 0;
  const keywordHints = new Set<string>();
  const hours: number[] = [];

  for (const msg of messages) {
    hours.push(msg.createdAt.getHours());

    if (msg.conversation.mode === "GREAT_FIGURE" && msg.conversation.figure) {
      const slug = msg.conversation.figure.slug;
      const existing = figureCounts.get(slug) ?? {
        name: msg.conversation.figure.nameUz,
        count: 0,
      };
      existing.count += 1;
      figureCounts.set(slug, existing);
    } else {
      standardMessages += 1;
    }

    for (const topic of extractKeywordTopics(msg.content)) {
      keywordHints.add(topic);
    }
  }

  return {
    figureCounts,
    standardMessages,
    keywordHints: [...keywordHints],
    hours,
  };
}

function extractFromFigures(
  figureCounts: Map<string, { name: string; count: number }>
): ExtractedInterest[] {
  const interests: ExtractedInterest[] = [];

  for (const [slug, { name, count }] of figureCounts) {
    if (count < 2) continue;

    const mapped = FIGURE_INTEREST_MAP[slug];
    const catalog = FIGURE_CATALOG.find((f) => f.slug === slug);

    interests.push({
      topic: mapped?.topic ?? catalog?.field ?? "umumiy bilim",
      topicRu: mapped?.topicRu,
      confidence: count >= 5 ? "high" : count >= 3 ? "medium" : "low",
      source: "great_figure",
      evidence: `${name} bilan ${count} marta suhbat — ${mapped?.topic ?? catalog?.field ?? "ta'limiy mavzu"}`,
    });
  }

  return interests;
}

async function llmSummarizeInterests(
  stats: ConversationStats,
  language: AppLanguage
): Promise<ExtractedInterest[]> {
  const figureList = [...stats.figureCounts.entries()]
    .map(([slug, v]) => `${slug}: ${v.count} marta`)
    .join(", ");

  const prompt =
    language === "uz"
      ? `Quyidagi BOLA FAOLLIGI statistikasi (suhbat matnlari emas):
- Buyuk Siymolar: ${figureList || "yo'q"}
- Oddiy suhbat xabarlari: ${stats.standardMessages}
- Aniqlangan mavzu kalit so'zlari: ${stats.keywordHints.join(", ") || "yo'q"}

Vazifa: bolaning qiziqishlarini 2-4 ta UMUMLASHTIRILGAN mavzu sifatida JSON qaytar.
Qoida: klinik tashxis qo'yma, so'zma-so'z iqtibos bermagin.
Format: {"interests":[{"topic":"...","confidence":"low|medium|high","evidence":"..."}]}`
      : `Статистика активности ребёнка (не тексты):
- Великие личности: ${figureList || "нет"}
- Обычные сообщения: ${stats.standardMessages}
- Ключевые темы: ${stats.keywordHints.join(", ") || "нет"}

Верни 2-4 обобщённых интереса в JSON. Без диагнозов и цитат.
Format: {"interests":[{"topic":"...","confidence":"low|medium|high","evidence":"..."}]}`;

  try {
    const result = await createChatCompletion(
      [
        {
          role: "system",
          content:
            "Sen bolalar qiziqishlarini umumlashtiruvchi tahlilchisan. Faqat JSON qaytar. Tashxis qo'yma.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.3, maxTokens: 400 },
      language
    );

    const match = result.content.match(/\{[\s\S]*\}/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]) as {
      interests?: Array<{
        topic: string;
        confidence?: string;
        evidence?: string;
      }>;
    };

    return (parsed.interests ?? []).map((i) => ({
      topic: i.topic,
      confidence: (["low", "medium", "high"].includes(i.confidence ?? "")
        ? i.confidence
        : "medium") as ExtractedInterest["confidence"],
      source: "combined" as const,
      evidence: i.evidence ?? i.topic,
    }));
  } catch {
    return [];
  }
}

function mergeInterests(
  ruleBased: ExtractedInterest[],
  llmBased: ExtractedInterest[]
): ExtractedInterest[] {
  const seen = new Set<string>();
  const merged: ExtractedInterest[] = [];

  for (const item of [...ruleBased, ...llmBased]) {
    const key = item.topic.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.slice(0, 6);
}

/**
 * Suhbatlardan bola qiziqishlarini chiqaradi.
 * Ota-onaga faqat umumlashtirilgan mavzular — so'zma-so'z matn emas.
 */
export async function extractInterests(
  messages: Array<{
    content: string;
    createdAt: Date;
    conversation: {
      mode: string;
      figure: { slug: string; nameUz: string; field: string } | null;
    };
  }>,
  language: AppLanguage = "uz"
): Promise<InterestExtractionResult> {
  const stats = buildStatsFromMessages(messages);

  const figureEngagement = [...stats.figureCounts.entries()].map(
    ([slug, v]) => ({ slug, name: v.name, count: v.count })
  );

  const ruleBased = extractFromFigures(stats.figureCounts);

  for (const topic of stats.keywordHints) {
    ruleBased.push({
      topic,
      confidence: "low",
      source: "conversation",
      evidence: `Suhbatlarda "${topic}" mavzusi muntazam uchraydi`,
    });
  }

  const llmBased =
    messages.length >= 3 ? await llmSummarizeInterests(stats, language) : [];

  return {
    interests: mergeInterests(ruleBased, llmBased),
    figureEngagement,
    totalMessages: messages.length,
  };
}

export { FIGURE_INTEREST_MAP };
