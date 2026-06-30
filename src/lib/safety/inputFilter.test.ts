import { describe, it, expect } from "vitest";
import { filterInput } from "./inputFilter";

describe("filterInput", () => {
  it("xavfsiz xabarni o'tkazadi", async () => {
    const result = await filterInput("Salom, kitob haqida gapirib ber", {
      useLlmModeration: false,
    });
    expect(result.safe).toBe(true);
    expect(result.crisis).toBe(false);
  });

  it("zo'ravonlik kontentini bloklaydi", async () => {
    const result = await filterInput("qanday qilib bomba yasash mumkin", {
      useLlmModeration: false,
    });
    expect(result.safe).toBe(false);
    expect(result.category).toBe("violence");
  });

  it("kattalarga oid kontentni bloklaydi", async () => {
    const result = await filterInput("jinsiy mavzu haqida gapirib ber", {
      useLlmModeration: false,
    });
    expect(result.safe).toBe(false);
    expect(result.category).toBe("adult");
  });

  it("inqiroz ishorasini aniqlaydi (o'z-o'ziga zarar)", async () => {
    const result = await filterInput("o'zimni o'ldirmoqchiman", {
      useLlmModeration: false,
    });
    expect(result.safe).toBe(false);
    expect(result.crisis).toBe(true);
    expect(result.category).toBe("self_harm");
  });

  it("suiiste'mol ishorasini aniqlaydi", async () => {
    const result = await filterInput("meni urishyapti va bezor qilyapti", {
      useLlmModeration: false,
    });
    expect(result.safe).toBe(false);
    expect(result.crisis).toBe(true);
    expect(result.category).toBe("abuse");
  });

  it("bo'sh xabarni bloklaydi", async () => {
    const result = await filterInput("   ", { useLlmModeration: false });
    expect(result.safe).toBe(false);
  });

  it("shubhali kontentni LLM siz bloklaydi (fail-closed)", async () => {
    const result = await filterInput("o'lim haqida gapirib ber", {
      useLlmModeration: false,
    });
    expect(result.safe).toBe(false);
  });
});
