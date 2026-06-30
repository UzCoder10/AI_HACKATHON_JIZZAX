import type { AppLanguage } from "@/types/safety";

/** Ruxsat etilgan kayfiyat emojilari */
export const MOOD_EMOJIS = ["😊", "🙂", "😐", "😔", "😢"] as const;
export type MoodEmoji = (typeof MOOD_EMOJIS)[number];

export const MOOD_SCORES: Record<MoodEmoji, number> = {
  "😊": 5,
  "🙂": 4,
  "😐": 3,
  "😔": 2,
  "😢": 1,
};

export type MoodTrend = "improving" | "stable" | "declining" | "insufficient_data";

export type InsightAlertType = "prolonged_low_mood" | "mood_decline" | "general";

export type InsightSeverity = "low" | "medium";

export interface MoodEntryInput {
  childId: string;
  emoji: MoodEmoji;
  note?: string;
}

export interface MoodEntryRecord {
  id: string;
  childId: string;
  emoji: MoodEmoji;
  score: number;
  note?: string;
  entryDate: string;
  createdAt: string;
}

export interface MoodAnalysisResult {
  trend: MoodTrend;
  averageScore: number;
  entryCount: number;
  periodStart: string;
  periodEnd: string;
  lowMoodDays: number;
  summary: string;
  alerts: InsightAlertPayload[];
}

export interface InsightAlertPayload {
  type: InsightAlertType;
  severity: InsightSeverity;
  summary: string;
  periodStart: string;
  periodEnd: string;
}

export interface ExtractedInterest {
  topic: string;
  topicRu?: string;
  confidence: "low" | "medium" | "high";
  source: "great_figure" | "conversation" | "combined";
  evidence: string; // umumlashtirilgan, so'zma-so'z emas
}

export interface InterestExtractionResult {
  interests: ExtractedInterest[];
  figureEngagement: Array<{ slug: string; name: string; count: number }>;
  totalMessages: number;
}

export interface ActivityStats {
  totalSessions: number;
  totalMessages: number;
  activeDays: number;
  peakHours: number[]; // 0-23
  averageMessagesPerDay: number;
}

export interface InsightReportData {
  childId: string;
  periodStart: string;
  periodEnd: string;
  moodAnalysis: MoodAnalysisResult;
  interests: ExtractedInterest[];
  activity: ActivityStats;
  activitySummary: string;
  summary: string;
  recommendations: string[];
}

export interface ApiMoodResponse {
  success: boolean;
  data?: MoodEntryRecord & { analysis?: Pick<MoodAnalysisResult, "trend" | "alerts"> };
  error?: string;
}

export interface ApiInsightReportResponse {
  success: boolean;
  data?: InsightReportData & { reportId?: string };
  error?: string;
}

export interface ReportGeneratorOptions {
  childId: string;
  language?: AppLanguage;
  periodDays?: number;
}
