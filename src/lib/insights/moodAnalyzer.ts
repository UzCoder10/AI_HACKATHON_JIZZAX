import type {
  InsightAlertPayload,
  MoodAnalysisResult,
  MoodEmoji,
  MoodTrend,
} from "@/types/insights";

export interface MoodDataPoint {
  entryDate: Date;
  emoji: string;
  score: number;
}

const LOW_MOOD_THRESHOLD = 2;
const PROLONGED_LOW_DAYS = 3;
const DECLINE_MIN_DROP = 0.8;

const TREND_LABELS_UZ: Record<MoodTrend, string> = {
  improving: "kayfiyat yaxshilanmoqda",
  stable: "kayfiyat barqaror",
  declining: "kayfiyat pasayish tendensiyasida",
  insufficient_data: "yetarli ma'lumot yo'q",
};

/**
 * Kayfiyat dinamikasini tahlil qiladi.
 * Klinik tashxis QO'YMMAYDI — faqat umumlashtirilgan signal/insight.
 */
export function analyzeMoodTrend(
  entries: MoodDataPoint[],
  periodStart: Date,
  periodEnd: Date
): MoodAnalysisResult {
  if (entries.length === 0) {
    return {
      trend: "insufficient_data",
      averageScore: 0,
      entryCount: 0,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      lowMoodDays: 0,
      summary: "Bu davrda kayfiyat yozuvlari yetarli emas.",
      alerts: [],
    };
  }

  const sorted = [...entries].sort(
    (a, b) => a.entryDate.getTime() - b.entryDate.getTime()
  );

  const scores = sorted.map((e) => e.score);
  const averageScore =
    Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

  const lowMoodDays = sorted.filter((e) => e.score <= LOW_MOOD_THRESHOLD).length;

  const trend = detectTrend(sorted);
  const alerts = detectMoodAlerts(sorted, periodStart, periodEnd, trend, lowMoodDays);

  const summary = buildMoodSummary(trend, averageScore, lowMoodDays, entries.length);

  return {
    trend,
    averageScore,
    entryCount: entries.length,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    lowMoodDays,
    summary,
    alerts,
  };
}

function detectTrend(entries: MoodDataPoint[]): MoodTrend {
  if (entries.length < 2) return "insufficient_data";

  const mid = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, mid);
  const secondHalf = entries.slice(mid);

  if (firstHalf.length === 0 || secondHalf.length === 0) return "stable";

  const avgFirst =
    firstHalf.reduce((s, e) => s + e.score, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((s, e) => s + e.score, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;

  if (diff >= 0.5) return "improving";
  if (diff <= -0.5) return "declining";
  return "stable";
}

function detectMoodAlerts(
  entries: MoodDataPoint[],
  periodStart: Date,
  periodEnd: Date,
  trend: MoodTrend,
  lowMoodDays: number
): InsightAlertPayload[] {
  const alerts: InsightAlertPayload[] = [];
  const period = {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };

  // Uzoq tushkunlik patterni
  if (lowMoodDays >= PROLONGED_LOW_DAYS) {
    alerts.push({
      type: "prolonged_low_mood",
      severity: lowMoodDays >= 5 ? "medium" : "low",
      summary: `So'nggi davrda ${lowMoodDays} kun past kayfiyat qayd etildi. Bu klinik tashxis emas — bolangiz bilan muloqot qilish va ehtiyotkorlik bilan kuzatish tavsiya etiladi.`,
      ...period,
    });
  }

  // Pasayish tendensiyasi
  if (trend === "declining" && entries.length >= 4) {
    const first = entries.slice(0, Math.ceil(entries.length / 2));
    const last = entries.slice(Math.ceil(entries.length / 2));
    const avgFirst = first.reduce((s, e) => s + e.score, 0) / first.length;
    const avgLast = last.reduce((s, e) => s + e.score, 0) / last.length;

    if (avgFirst - avgLast >= DECLINE_MIN_DROP) {
      alerts.push({
        type: "mood_decline",
        severity: "low",
        summary:
          "Kayfiyatda pasayish tendensiyasi kuzatildi. Bu faqat umumlashtirilgan signal — kerak bo'lsa ishonchli katta bilan gaplashish mumkin.",
        ...period,
      });
    }
  }

  return alerts;
}

function buildMoodSummary(
  trend: MoodTrend,
  averageScore: number,
  lowMoodDays: number,
  totalEntries: number
): string {
  const trendLabel = TREND_LABELS_UZ[trend];
  return (
    `${totalEntries} kunlik yozuv asosida o'rtacha kayfiyat ${averageScore}/5. ` +
    `Tendensiya: ${trendLabel}. ` +
    (lowMoodDays > 0
      ? `Past kayfiyatli kunlar: ${lowMoodDays}. `
      : "") +
    `Bu ma'lumot tibbiy tashxis emas.`
  );
}

export function isValidMoodEmoji(value: string): value is MoodEmoji {
  return ["😊", "🙂", "😐", "😔", "😢"].includes(value);
}

export { TREND_LABELS_UZ };
