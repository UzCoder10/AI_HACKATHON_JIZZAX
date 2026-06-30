import { describe, it, expect } from "vitest";
import { analyzeMoodTrend, isValidMoodEmoji } from "./moodAnalyzer";

function makeEntry(daysAgo: number, score: number, emoji = "😐") {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return { entryDate: d, emoji, score };
}

describe("isValidMoodEmoji", () => {
  it("ruxsat etilgan emojilarni qabul qiladi", () => {
    expect(isValidMoodEmoji("😊")).toBe(true);
    expect(isValidMoodEmoji("😢")).toBe(true);
  });

  it("noto'g'ri emojini rad etadi", () => {
    expect(isValidMoodEmoji("😡")).toBe(false);
  });
});

describe("analyzeMoodTrend", () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);

  it("yetarli ma'lumot yo'q bo'lsa insufficient_data", () => {
    const result = analyzeMoodTrend([], start, end);
    expect(result.trend).toBe("insufficient_data");
    expect(result.alerts).toHaveLength(0);
  });

  it("uzoq tushkunlik patternini aniqlaydi", () => {
    const entries = [
      makeEntry(5, 1, "😢"),
      makeEntry(4, 2, "😔"),
      makeEntry(3, 1, "😢"),
      makeEntry(2, 2, "😔"),
    ];
    const result = analyzeMoodTrend(entries, start, end);
    expect(result.lowMoodDays).toBeGreaterThanOrEqual(3);
    expect(result.alerts.some((a) => a.type === "prolonged_low_mood")).toBe(true);
    expect(result.alerts[0]?.summary).toContain("tashxis emas");
  });

  it("yaxshilanish tendensiyasini aniqlaydi", () => {
    const entries = [
      makeEntry(5, 2, "😔"),
      makeEntry(4, 2, "😔"),
      makeEntry(2, 4, "🙂"),
      makeEntry(1, 5, "😊"),
    ];
    const result = analyzeMoodTrend(entries, start, end);
    expect(result.trend).toBe("improving");
  });

  it("xulosa klinik tashxis qo'ymaydi", () => {
    const entries = [makeEntry(1, 1, "😢"), makeEntry(2, 1, "😢"), makeEntry(3, 2, "😔")];
    const result = analyzeMoodTrend(entries, start, end);
    expect(result.summary.toLowerCase()).not.toContain("depressiya");
    expect(result.summary).toContain("tibbiy tashxis emas");
  });
});
