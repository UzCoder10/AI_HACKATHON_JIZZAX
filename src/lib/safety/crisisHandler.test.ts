import { describe, it, expect } from "vitest";
import { handleCrisis } from "./crisisHandler";

describe("crisisHandler", () => {
  it("yoshga mos tinchlantiruvchi javob qaytaradi", () => {
    const result = handleCrisis({
      age: 8,
      language: "uz",
      category: "self_harm",
      originalText: "o'zimni o'ldirmoqchiman",
    });
    expect(result.childMessage).toContain("ota-onang");
    expect(result.childMessage).toContain("112");
  });

  it("tashxis qo'ymaydi — faqat kattaga yo'naltiradi", () => {
    const result = handleCrisis({
      age: 12,
      language: "uz",
      category: "fear",
      originalText: "juda qo'rqaman",
    });
    expect(result.childMessage.toLowerCase()).not.toMatch(/tashxising|depressiya|tashxis:/);
    expect(result.childMessage).toMatch(/112|ota-ona|katta/i);
  });

  it("HIGH severity SafetyEvent yaratadi", () => {
    const result = handleCrisis({
      childId: "child-1",
      sessionId: "sess-1",
      age: 10,
      language: "ru",
      category: "abuse",
      originalText: "meni urishyapti",
    });
    expect(result.event.severity).toBe("high");
    expect(result.event.source).toBe("crisis");
    expect(result.event.childId).toBe("child-1");
    expect(result.event.summary).toContain("Inqiroz");
  });

  it("to'liq xabar matnini saqlamaydi — faqat qisqa xulosa", () => {
    const longText = "o'zimni o'ldirmoqchiman ".repeat(20);
    const result = handleCrisis({
      age: 9,
      language: "uz",
      originalText: longText,
    });
    expect(result.event.summary.length).toBeLessThan(200);
  });
});
