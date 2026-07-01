import { describe, expect, it } from "vitest";
import {
  cyrillicRatio,
  containsCyrillic,
  normalizeForRagIndex,
  transliterateCyrillicToLatin,
} from "./uzbekTransliterate";
import { cleanExtractedText, splitIbnSinoStories } from "./textClean";

describe("uzbekTransliterate", () => {
  it("transliterates Cyrillic Uzbek", () => {
    const cyr = "Mirzo Ulugʻbek rasadxona qurdi";
    expect(containsCyrillic("Мирzo Улугбек")).toBe(true);
    expect(transliterateCyrillicToLatin("Мирзо Улугбек")).toContain("Ulug");
  });

  it("normalizes for RAG index", () => {
    const mixed = normalizeForRagIndex("Мирzo Ulug'bek");
    expect(containsCyrillic(mixed)).toBe(false);
  });

  it("detects cyrillic ratio", () => {
    expect(cyrillicRatio("Hello world")).toBe(0);
    expect(cyrillicRatio("Салом")).toBeGreaterThan(0.5);
  });
});

describe("textClean", () => {
  it("removes page numbers", () => {
    const raw = "Matn boshlandi\n\n42\n\nDavom etadi";
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).not.toMatch(/^\s*42\s*$/m);
    expect(cleaned).toContain("Davom");
  });

  it("splits ibn sino stories", () => {
    const text = "Kirish matn\n\nHikoya 1\nBirinchi hikoya matni juda uzun ".repeat(20) +
      "\n\nHikoya 2\nIkkinchi hikoya " + "matn ".repeat(50);
    const stories = splitIbnSinoStories(text);
    expect(stories.length).toBeGreaterThanOrEqual(1);
  });
});
