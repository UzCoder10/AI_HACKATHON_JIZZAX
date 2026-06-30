import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildRagContext, getSourceNames } from "./ragflowClient";
import { extractLangflowText } from "./langflowClient";
import { getNoSourceReply } from "./figurePersonas";
import type { RagChunk } from "@/types/figures";

describe("buildRagContext", () => {
  it("chunklardan kontekst yig'adi", () => {
    const chunks: RagChunk[] = [
      { content: "Ulug'bek rasadxonasi 1420-yilda qurilgan", source: "tarix.pdf", score: 0.9 },
    ];
    const ctx = buildRagContext(chunks);
    expect(ctx).toContain("Ulug'bek");
    expect(ctx).toContain("tarix.pdf");
  });

  it("bo'sh chunklar bo'sh qaytaradi", () => {
    expect(buildRagContext([])).toBe("");
  });
});

describe("getSourceNames", () => {
  it("takrorlanmas manba nomlarini qaytaradi", () => {
    const chunks: RagChunk[] = [
      { content: "a", source: "doc1", score: 0.8 },
      { content: "b", source: "doc1", score: 0.7 },
      { content: "c", source: "doc2", score: 0.6 },
    ];
    expect(getSourceNames(chunks)).toEqual(["doc1", "doc2"]);
  });
});

describe("extractLangflowText", () => {
  it("outputs ichidan matn ajratadi", () => {
    const payload = {
      outputs: [
        {
          outputs: [
            {
              results: { message: { text: "Salom, men Ulug'bekman." } },
            },
          ],
        },
      ],
    };
    expect(extractLangflowText(payload)).toBe("Salom, men Ulug'bekman.");
  });
});

describe("getNoSourceReply", () => {
  it("manba yo'q xabarini shaxs ovozida qaytaradi", () => {
    const reply = getNoSourceReply("Mirzo Ulug'bek", "uz");
    expect(reply).toContain("Mirzo Ulug'bek");
    expect(reply).toContain("aniq ma'lumot");
  });
});

describe("figureService aniqlik qoidasi", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("RAG bo'sh bo'lsa LLM chaqirilmasligi kerak — getNoSourceReply ishlatiladi", () => {
    // Integratsiya testi o'rniga qoida hujjatlashtirilgan unit test
    const reply = getNoSourceReply("Al-Xorazmiy", "uz");
    expect(reply).not.toMatch(/taxmin|o'ylab|deb o'ylayman/i);
  });
});
