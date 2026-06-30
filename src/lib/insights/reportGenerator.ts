import { createChatCompletion } from "@/lib/ai/alemClient";
import {
  getMoodEntries,
  getChildMessagesInPeriod,
  getChildConversationsInPeriod,
  saveInsightAlert,
  saveInsightReport,
} from "@/lib/db/insightQueries";
import { analyzeMoodTrend } from "./moodAnalyzer";
import { extractInterests } from "./interestExtractor";
import type {
  ActivityStats,
  InsightReportData,
  ReportGeneratorOptions,
} from "@/types/insights";
import type { AppLanguage } from "@/types/safety";

const DEFAULT_PERIOD_DAYS = 7;

function periodBounds(days: number): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function computeActivityStats(
  messages: Array<{ createdAt: Date }>,
  conversations: Array<{ id: string }>,
  periodDays: number
): ActivityStats {
  const hours = messages.map((m) => m.createdAt.getHours());
  const daySet = new Set(
    messages.map((m) => m.createdAt.toISOString().slice(0, 10))
  );

  const hourCounts = new Map<number, number>();
  for (const h of hours) {
    hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  }

  const peakHours = [...hourCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h);

  return {
    totalSessions: conversations.length,
    totalMessages: messages.length,
    activeDays: daySet.size,
    peakHours,
    averageMessagesPerDay:
      periodDays > 0
        ? Math.round((messages.length / periodDays) * 10) / 10
        : 0,
  };
}

function buildActivitySummary(activity: ActivityStats, language: AppLanguage): string {
  const peak =
    activity.peakHours.length > 0
      ? activity.peakHours.map((h) => `${h}:00`).join(", ")
      : language === "uz"
        ? "aniqlanmadi"
        : "не определено";

  if (language === "uz") {
    return (
      `${activity.activeDays} kun faol, jami ${activity.totalMessages} xabar, ` +
      `${activity.totalSessions} ta suhbat. Eng faol vaqt: ${peak}.`
    );
  }
  return (
    `${activity.activeDays} активных дней, ${activity.totalMessages} сообщений, ` +
    `${activity.totalSessions} бесед. Пик активности: ${peak}.`
  );
}

function buildRuleBasedRecommendations(
  interests: Array<{ topic: string }>,
  moodTrend: string,
  language: AppLanguage
): string[] {
  const recs: string[] = [];

  for (const interest of interests.slice(0, 2)) {
    if (language === "uz") {
      recs.push(
        `Farzandingiz "${interest.topic}" mavzusiga qiziqyapti — shu yo'nalishda birga kitob o'qing yoki qisqa video tomosha qiling.`
      );
    } else {
      recs.push(
        `Ребёнку интересна тема «${interest.topic}» — почитайте вместе книгу или посмотрите короткое видео.`
      );
    }
  }

  if (moodTrend === "declining" || moodTrend === "insufficient_data") {
    recs.push(
      language === "uz"
        ? "Kayfiyatda pasayish belgilari bo'lsa, bolangiz bilan sokin vaqt o'tkazing — bu tibbiy tavsiya emas."
        : "При признаках снижения настроения проведите спокойное время вместе — это не медицинский совет."
    );
  }

  if (recs.length === 0) {
    recs.push(
      language === "uz"
        ? "Farzandingiz bilan muntazam qisqa suhbatlar qilib, qiziqishlarini kuzatib boring."
        : "Регулярно общайтесь с ребёнком и следите за его интересами."
    );
  }

  return recs.slice(0, 4);
}

async function generateLlmSummary(
  data: Omit<InsightReportData, "summary" | "recommendations">,
  language: AppLanguage
): Promise<{ summary: string; recommendations: string[] }> {
  const interestList = data.interests.map((i) => i.topic).join(", ") || "aniqlanmadi";

  const prompt =
    language === "uz"
      ? `OTA-ONA UCHUN HAFTALIK INSIGHT (tashxis EMAS):

Kayfiyat: ${data.moodAnalysis.summary}
Tendensiya: ${data.moodAnalysis.trend}
Qiziqishlar: ${interestList}
Faollik: ${data.activitySummary}

Vazifa: 2-3 gaplik UMUMLASHTIRILGAN xulosa va 2-3 ta oilaviy tavsiya yoz.
Qoidalar: klinik tashxis qo'yma, suhbat iqtibosi bermagin, "depressiya/tashxis" so'zlarini ishlatma.
JSON: {"summary":"...","recommendations":["...","..."]}`
      : `ЕЖЕНЕДЕЛЬНЫЙ INSIGHT ДЛЯ РОДИТЕЛЕЙ (не диагноз):

Настроение: ${data.moodAnalysis.summary}
Тренд: ${data.moodAnalysis.trend}
Интересы: ${interestList}
Активность: ${data.activitySummary}

JSON: {"summary":"...","recommendations":["..."]}. Без диагнозов и цитат.`;

  try {
    const result = await createChatCompletion(
      [
        {
          role: "system",
          content:
            "Sen bolalar faolligi bo'yicha ota-ona insight yordamchisisan. Faqat JSON. Tashxis qo'yma.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.4, maxTokens: 600 },
      language
    );

    const match = result.content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as {
        summary?: string;
        recommendations?: string[];
      };
      if (parsed.summary) {
        return {
          summary: parsed.summary,
          recommendations: parsed.recommendations ?? [],
        };
      }
    }
  } catch {
    // fallback quyida
  }

  return {
    summary: data.moodAnalysis.summary,
    recommendations: buildRuleBasedRecommendations(
      data.interests,
      data.moodAnalysis.trend,
      language
    ),
  };
}

/**
 * Haftalik InsightReport yaratadi — umumlashtirilgan, so'zma-so'z suhbat yo'q.
 */
export async function generateWeeklyReport(
  options: ReportGeneratorOptions
): Promise<InsightReportData & { reportId?: string }> {
  const { childId, language = "uz", periodDays = DEFAULT_PERIOD_DAYS } = options;
  const { start, end } = periodBounds(periodDays);

  const [moodEntries, messages, conversations] = await Promise.all([
    getMoodEntries(childId, start, end).catch(() => []),
    getChildMessagesInPeriod(childId, start, end).catch(() => []),
    getChildConversationsInPeriod(childId, start, end).catch(() => []),
  ]);

  const moodAnalysis = analyzeMoodTrend(
    moodEntries.map((e) => ({
      entryDate: e.entryDate,
      emoji: e.emoji,
      score: e.score,
    })),
    start,
    end
  );

  // Insight ogohlantirishlari (SafetyEvent EMAS)
  for (const alert of moodAnalysis.alerts) {
    try {
      await saveInsightAlert({
        childId,
        type:
          alert.type === "prolonged_low_mood"
            ? "PROLONGED_LOW_MOOD"
            : alert.type === "mood_decline"
              ? "MOOD_DECLINE"
              : "GENERAL",
        severity: alert.severity === "medium" ? "MEDIUM" : "LOW",
        summary: alert.summary,
        periodStart: new Date(alert.periodStart),
        periodEnd: new Date(alert.periodEnd),
      });
    } catch (error) {
      console.error("[reportGenerator] InsightAlert saqlash xatolik:", error);
    }
  }

  const interestResult = await extractInterests(messages, language);
  const activity = computeActivityStats(messages, conversations, periodDays);
  const activitySummary = buildActivitySummary(activity, language);

  const partialReport: Omit<InsightReportData, "summary" | "recommendations"> = {
    childId,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    moodAnalysis,
    interests: interestResult.interests,
    activity,
    activitySummary,
  };

  const { summary, recommendations: llmRecs } = await generateLlmSummary(
    partialReport,
    language
  );

  const recommendations =
    llmRecs.length > 0
      ? llmRecs
      : buildRuleBasedRecommendations(
          interestResult.interests,
          moodAnalysis.trend,
          language
        );

  const reportData: InsightReportData = {
    ...partialReport,
    summary,
    recommendations,
  };

  let reportId: string | undefined;
  try {
    const saved = await saveInsightReport({
      childId,
      periodStart: start,
      periodEnd: end,
      moodTrend: moodAnalysis.trend,
      moodSummary: moodAnalysis.summary,
      interests: interestResult.interests.map((i) => i.topic),
      activitySummary,
      summary,
      recommendations,
    });
    reportId = saved.id;
  } catch (error) {
    console.error("[reportGenerator] InsightReport saqlash xatolik:", error);
  }

  return { ...reportData, reportId };
}

export { analyzeMoodTrend } from "./moodAnalyzer";
export { extractInterests } from "./interestExtractor";
