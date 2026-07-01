import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFilterChildInput = vi.fn();
const mockFilterAiOutput = vi.fn();
const mockGenerateChatCompletion = vi.fn();
const mockGetAllomaContext = vi.fn();
const mockGetGreatFigureBySlug = vi.fn();
const mockGetOrCreateFigureConversation = vi.fn();
const mockGetConversationMessages = vi.fn();
const mockSaveConversationMessage = vi.fn();
const mockIsAnthropicConfigured = vi.fn();

vi.mock("@/lib/safety", () => ({
  filterChildInput: (...args: unknown[]) => mockFilterChildInput(...args),
  filterAiOutput: (...args: unknown[]) => mockFilterAiOutput(...args),
}));

vi.mock("@/lib/llm", () => ({
  getClient: () => ({
    generateChatCompletion: (...args: unknown[]) => mockGenerateChatCompletion(...args),
  }),
  clientFor: () => ({
    generateChatCompletion: (...args: unknown[]) => mockGenerateChatCompletion(...args),
  }),
  isAnthropicConfigured: () => mockIsAnthropicConfigured(),
}));

vi.mock("@/lib/db/queries", () => ({
  getGreatFigureBySlug: (...args: unknown[]) => mockGetGreatFigureBySlug(...args),
  getOrCreateFigureConversation: (...args: unknown[]) => mockGetOrCreateFigureConversation(...args),
  getConversationMessages: (...args: unknown[]) => mockGetConversationMessages(...args),
  saveConversationMessage: (...args: unknown[]) => mockSaveConversationMessage(...args),
}));

vi.mock("@/lib/rag/allomaContext", () => ({
  getAllomaContext: (...args: unknown[]) => mockGetAllomaContext(...args),
}));

vi.mock("@/lib/rag/ragflowClient", () => ({
  isRagflowConfigured: () => true,
  buildRagContext: () => "[Manba] Test kontekst",
  getSourceNames: () => ["test.pdf"],
}));

import { askAlloma } from "./askAlloma";
import { buildAllomaSystemPrompt } from "./personas";
import { beruniyPersona } from "./personas/beruniy";

describe("buildAllomaSystemPrompt", () => {
  it("persona va RAG kontekstni birlashtiradi", () => {
    const prompt = buildAllomaSystemPrompt({
      persona: beruniyPersona,
      language: "uz",
      age: 11,
      ragContext: "[Manba 1: beruniy.txt]\nYulduzlar jadvali",
    });

    expect(prompt).toContain("Abu Rayhon Beruniy");
    expect(prompt).toContain("MANBA KONTEKST");
    expect(prompt).toContain("Yulduzlar jadvali");
    expect(prompt).toContain("Bu haqda aniq bilmayman");
  });
});

describe("askAlloma", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAnthropicConfigured.mockReturnValue(true);
    mockGetGreatFigureBySlug.mockResolvedValue({
      id: "catalog-abu-rayhon-beruniy",
      slug: "abu-rayhon-beruniy",
      nameUz: "Abu Rayhon Beruniy",
      nameRu: "Абу Райхон Beruniy",
      field: "astronomiya",
      personaPrompt: "Beruniy",
    });
    mockGetOrCreateFigureConversation.mockResolvedValue({ id: "session-1" });
    mockGetConversationMessages.mockResolvedValue([]);
    mockSaveConversationMessage.mockResolvedValue(undefined);
    mockFilterChildInput.mockResolvedValue({
      allowed: true,
      crisis: false,
      content: "test",
      eventLogged: false,
    });
    mockFilterAiOutput.mockImplementation(async ({ text }: { text: string }) => ({
      allowed: true,
      crisis: false,
      content: text,
      eventLogged: false,
    }));
    mockGetAllomaContext.mockResolvedValue({
      allomaId: "beruniy",
      slug: "abu-rayhon-beruniy",
      figureName: "Abu Rayhon Beruniy",
      question: "yulduzlar haqida",
      context: "[Manba 1: beruniy-astronomiya.txt]\nBeruniy yulduzlar jadvalini tuzgan",
      chunks: [{ content: "Beruniy yulduzlar jadvalini tuzgan", source: "beruniy-astronomiya.txt", score: 0.9 }],
      sources: ["beruniy-astronomiya.txt"],
      found: true,
    });
    mockGenerateChatCompletion.mockResolvedValue({
      content: "Men Beruniyman. Manbalarimga ko'ra, yulduzlar jadvalini tuzganman.",
    });
  });

  it("RAG kontekst + persona bilan javob qaytaradi", async () => {
    const result = await askAlloma({
      allomaId: "beruniy",
      question: "yulduzlar haqida gapir",
      childId: "child-1",
      age: 11,
      language: "uz",
    });

    expect(result.grounded).toBe(true);
    expect(result.sources).toContain("beruniy-astronomiya.txt");
    expect(result.reply).toContain("Beruniy");
    expect(mockGenerateChatCompletion).toHaveBeenCalledTimes(1);

    const messages = mockGenerateChatCompletion.mock.calls[0][0];
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("MANBA KONTEKST");
    expect(messages.at(-1).content).toBe("yulduzlar haqida gapir");
  });

  it("RAG bo'sh bo'lsa LLM chaqirilmaydi", async () => {
    mockGetAllomaContext.mockResolvedValue({
      allomaId: "beruniy",
      slug: "abu-rayhon-beruniy",
      figureName: "Abu Rayhon Beruniy",
      question: "noma'lum",
      context: "",
      chunks: [],
      sources: [],
      found: false,
    });

    const result = await askAlloma({
      allomaId: "beruniy",
      question: "noma'lum mavzu",
      childId: "child-1",
      age: 11,
      language: "uz",
    });

    expect(mockGenerateChatCompletion).not.toHaveBeenCalled();
    expect(result.grounded).toBe(true);
    expect(result.reply).toContain("ma'lumot topilmadi");
  });

  it("nomaqbul kirish bloklanadi — LLM chaqirilmaydi", async () => {
    mockFilterChildInput.mockResolvedValue({
      allowed: false,
      crisis: false,
      content: "Bu mavzu hozircha mos emas.",
      eventLogged: true,
    });

    const result = await askAlloma({
      allomaId: "beruniy",
      question: "yomon so'z",
      childId: "child-1",
      age: 11,
      language: "uz",
    });

    expect(mockGenerateChatCompletion).not.toHaveBeenCalled();
    expect(result.filtered).toBe(true);
    expect(result.reply).toBe("Bu mavzu hozircha mos emas.");
  });

  it("suhbat tarixini LLM ga uzatadi", async () => {
    await askAlloma({
      allomaId: "beruniy",
      question: "yana batafsil",
      childId: "child-1",
      age: 11,
      language: "uz",
      conversationHistory: [
        { role: "user", content: "yulduzlar haqida" },
        { role: "assistant", content: "Avvalgi javob" },
      ],
    });

    const messages = mockGenerateChatCompletion.mock.calls[0][0];
    expect(messages).toHaveLength(4); // system + 2 history + user
    expect(messages[1].content).toBe("yulduzlar haqida");
    expect(messages[2].content).toBe("Avvalgi javob");
  });
});
