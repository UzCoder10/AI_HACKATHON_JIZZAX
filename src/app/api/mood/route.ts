import { NextRequest, NextResponse } from "next/server";
import { saveMoodEntry, getMoodEntries, saveInsightAlert } from "@/lib/db/insightQueries";
import { analyzeMoodTrend, isValidMoodEmoji } from "@/lib/insights/moodAnalyzer";
import type { ApiMoodResponse, MoodEmoji } from "@/types/insights";

interface MoodBody {
  childId?: string;
  emoji?: string;
  note?: string;
}

function parseMoodBody(body: MoodBody) {
  const childId = body.childId?.trim();
  const emoji = body.emoji?.trim();
  const note = body.note?.trim();

  if (!childId) return { error: "childId talab qilinadi" };
  if (!emoji || !isValidMoodEmoji(emoji)) {
    return { error: "emoji 😊 🙂 😐 😔 😢 dan biri bo'lishi kerak" };
  }
  if (note && note.length > 200) {
    return { error: "note juda uzun (max 200)" };
  }

  return { data: { childId, emoji: emoji as MoodEmoji, note } };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MoodBody;
    const parsed = parseMoodBody(body);

    if ("error" in parsed) {
      return NextResponse.json<ApiMoodResponse>(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const entry = await saveMoodEntry(parsed.data);

    // So'nggi 7 kunlik tahlil
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 6);
    periodStart.setHours(0, 0, 0, 0);

    let analysis;
    try {
      const entries = await getMoodEntries(parsed.data.childId, periodStart, periodEnd);
      analysis = analyzeMoodTrend(
        entries.map((e) => ({
          entryDate: e.entryDate,
          emoji: e.emoji,
          score: e.score,
        })),
        periodStart,
        periodEnd
      );

      // Yangi insight ogohlantirishlari (SafetyEvent emas)
      for (const alert of analysis.alerts) {
        await saveInsightAlert({
          childId: parsed.data.childId,
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
      }
    } catch (error) {
      console.error("[POST /api/mood] tahlil xatolik:", error);
    }

    return NextResponse.json<ApiMoodResponse>({
      success: true,
      data: {
        id: entry.id,
        childId: entry.childId,
        emoji: entry.emoji as MoodEmoji,
        score: entry.score,
        note: entry.note ?? undefined,
        entryDate: entry.entryDate.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        analysis: analysis
          ? { trend: analysis.trend, alerts: analysis.alerts }
          : undefined,
      },
    });
  } catch (error) {
    console.error("[POST /api/mood]", error);
    return NextResponse.json<ApiMoodResponse>(
      { success: false, error: "Kayfiyat saqlashda xatolik" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get("childId");
    const days = parseInt(request.nextUrl.searchParams.get("days") ?? "7", 10);

    if (!childId) {
      return NextResponse.json<ApiMoodResponse>(
        { success: false, error: "childId talab qilinadi" },
        { status: 400 }
      );
    }

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days + 1);
    periodStart.setHours(0, 0, 0, 0);

    const entries = await getMoodEntries(childId, periodStart, periodEnd);
    const analysis = analyzeMoodTrend(
      entries.map((e) => ({
        entryDate: e.entryDate,
        emoji: e.emoji,
        score: e.score,
      })),
      periodStart,
      periodEnd
    );

    return NextResponse.json({
      success: true,
      data: {
        entries: entries.map((e) => ({
          id: e.id,
          emoji: e.emoji,
          score: e.score,
          entryDate: e.entryDate.toISOString(),
        })),
        analysis,
      },
    });
  } catch (error) {
    console.error("[GET /api/mood]", error);
    return NextResponse.json<ApiMoodResponse>(
      { success: false, error: "Kayfiyat ma'lumotini olishda xatolik" },
      { status: 500 }
    );
  }
}
