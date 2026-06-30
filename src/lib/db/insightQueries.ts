import { prisma } from "./client";
import type { MoodEmoji } from "@/types/insights";
import { MOOD_SCORES } from "@/types/insights";

export async function saveMoodEntry(params: {
  childId: string;
  emoji: MoodEmoji;
  note?: string;
  entryDate?: Date;
}) {
  const entryDate = params.entryDate ?? startOfDay(new Date());
  const score = MOOD_SCORES[params.emoji];

  return prisma.moodEntry.upsert({
    where: {
      childId_entryDate: {
        childId: params.childId,
        entryDate,
      },
    },
    update: {
      emoji: params.emoji,
      score,
      note: params.note ?? null,
    },
    create: {
      childId: params.childId,
      emoji: params.emoji,
      score,
      note: params.note ?? null,
      entryDate,
    },
  });
}

export async function getMoodEntries(
  childId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return prisma.moodEntry.findMany({
    where: {
      childId,
      entryDate: { gte: periodStart, lte: periodEnd },
    },
    orderBy: { entryDate: "asc" },
  });
}

export async function saveInsightAlert(params: {
  childId: string;
  type: "PROLONGED_LOW_MOOD" | "MOOD_DECLINE" | "GENERAL";
  severity: "LOW" | "MEDIUM";
  summary: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  return prisma.insightAlert.create({ data: params });
}

export async function getRecentInsightAlerts(childId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.insightAlert.findMany({
    where: { childId, createdAt: { gte: since }, acknowledged: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveInsightReport(params: {
  childId: string;
  periodStart: Date;
  periodEnd: Date;
  moodTrend: string;
  moodSummary: string;
  interests: string[];
  activitySummary: string;
  summary: string;
  recommendations: string[];
}) {
  return prisma.insightReport.create({ data: params });
}

export async function getChildConversationsInPeriod(
  childId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return prisma.conversation.findMany({
    where: {
      childId,
      updatedAt: { gte: periodStart, lte: periodEnd },
    },
    include: {
      figure: true,
      messages: {
        where: { role: "user" },
        select: { id: true, createdAt: true, content: true },
      },
    },
  });
}

export async function getChildMessagesInPeriod(
  childId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return prisma.message.findMany({
    where: {
      role: "user",
      createdAt: { gte: periodStart, lte: periodEnd },
      conversation: { childId },
    },
    select: {
      id: true,
      createdAt: true,
      content: true,
      conversation: {
        select: {
          mode: true,
          figure: { select: { slug: true, nameUz: true, field: true } },
        },
      },
    },
  });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
