import { describe, it, expect } from "vitest";
import { filterOutput } from "./outputFilter";

const baseOpts = { age: 10, language: "uz" as const, useLlmModeration: false };

describe("filterOutput", () => {
  it("xavfsiz javobni o'tkazadi", async () => {
    const result = await filterOutput("Quyosh sistemasida 8 ta sayyora bor.", baseOpts);
    expect(result.safe).toBe(true);
    expect(result.content).toContain("sayyora");
  });

  it("do'st/companion tilini bloklaydi va fallback beradi", async () => {
    const result = await filterOutput("Men sening do'stingman, har doim yoningdaman!", baseOpts);
    expect(result.safe).toBe(false);
    expect(result.category).toBe("companion");
    expect(result.content).toContain("javob bera olmayman");
  });

  it("tashxis tilini bloklaydi", async () => {
    const result = await filterOutput("Sening tashxising depressiya.", baseOpts);
    expect(result.safe).toBe(false);
    expect(result.category).toBe("diagnosis");
  });

  it("kattalarga oid kontentni bloklaydi", async () => {
    const result = await filterOutput("Bu jinsiy mavzu haqida gap.", baseOpts);
    expect(result.safe).toBe(false);
    expect(result.category).toBe("adult");
  });

  it("bo'sh javob uchun fallback qaytaradi", async () => {
    const result = await filterOutput("", baseOpts);
    expect(result.safe).toBe(false);
    expect(result.content.length).toBeGreaterThan(0);
  });
});
