import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Xavfsizlik audit — barcha bola-AI oqimlari filterChildInput + filterAiOutput dan o'tishi kerak.
 */

const mockFilterChildInput = vi.fn();
const mockFilterAiOutput = vi.fn();
const mockCreateChatCompletion = vi.fn();
const mockGetOrCreateConversation = vi.fn();
const mockGetConversationMessages = vi.fn();
const mockSaveConversationMessage = vi.fn();
const mockGetAllomaContext = vi.fn();
const mockGetGreatFigureBySlug = vi.fn();
const mockGetOrCreateFigureConversation = vi.fn();

vi.mock("@/lib/safety", () => ({
  filterChildInput: (...args: unknown[]) => mockFilterChildInput(...args),
  filterAiOutput: (...args: unknown[]) => mockFilterAiOutput(...args),
}));

vi.mock("@/lib/ai/alemClient", () => ({
  createChatCompletion: (...args: unknown[]) => mockCreateChatCompletion(...args),
}));

vi.mock("@/lib/llm", () => ({
  getClient: () => ({
    generateChatCompletion: (...args: unknown[]) => mockCreateChatCompletion(...args),
  }),
  clientFor: () => ({
    generateChatCompletion: (...args: unknown[]) => mockCreateChatCompletion(...args),
  }),
  isAnthropicConfigured: () => true,
}));

vi.mock("@/lib/db/queries", () => ({
  getOrCreateConversation: (...args: unknown[]) => mockGetOrCreateConversation(...args),
  getConversationMessages: (...args: unknown[]) => mockGetConversationMessages(...args),
  saveConversationMessage: (...args: unknown[]) => mockSaveConversationMessage(...args),
  getGreatFigureBySlug: (...args: unknown[]) => mockGetGreatFigureBySlug(...args),
  getOrCreateFigureConversation: (...args: unknown[]) => mockGetOrCreateFigureConversation(...args),
}));

vi.mock("@/lib/rag/allomaContext", () => ({
  getAllomaContext: (...args: unknown[]) => mockGetAllomaContext(...args),
}));

vi.mock("@/lib/rag/ragflowClient", () => ({
  isRagflowConfigured: () => true,
  buildRagContext: () => "[Manba] Test kontekst",
  getSourceNames: () => ["test.pdf"],
}));

vi.mock("@/lib/rag/langflowClient", () => ({
  isLangflowConfigured: () => false,
  runFigureFlow: vi.fn(),
}));

describe("xavfsizlik audit — AI oqimlari", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrCreateConversation.mockResolvedValue({ id: "conv-1" });
    mockGetConversationMessages.mockResolvedValue([]);
    mockSaveConversationMessage.mockResolvedValue(undefined);
    mockFilterChildInput.mockResolvedValue({ allowed: true, crisis: false, content: "test", eventLogged: false });
    mockFilterAiOutput.mockResolvedValue({ allowed: true, crisis: false, content: "Xavfsiz javob", eventLogged: false });
    mockCreateChatCompletion.mockResolvedValue({ content: "LLM javob" });
    mockGetGreatFigureBySlug.mockResolvedValue({
      id: "fig-1",
      slug: "mirzo-ulugbek",
      nameUz: "Mirzo Ulug'bek",
      nameRu: "Mirzo Ulug'bek",
      field: "astronomiya",
      personaPrompt: "Ulug'bek persona",
    });
    mockGetOrCreateFigureConversation.mockResolvedValue({ id: "fig-conv-1" });
    mockGetAllomaContext.mockResolvedValue({
      allomaId: "mirzo-ulugbek",
      slug: "mirzo-ulugbek",
      figureName: "Mirzo Ulug'bek",
      question: "test",
      context: "[Manba 1: doc.pdf]\nRAG chunk",
      chunks: [{ content: "RAG chunk", source: "doc.pdf", score: 0.9 }],
      sources: ["doc.pdf"],
      found: true,
    });
  });

  it("chatService: input + output filter chaqiriladi", async () => {
    const { sendMessage } = await import("@/lib/ai/chatService");

    await sendMessage({
      childId: "child-1",
      message: "Salom",
      age: 9,
      name: "Ali",
      language: "uz",
    });

    expect(mockFilterChildInput).toHaveBeenCalledTimes(1);
    expect(mockFilterAiOutput).toHaveBeenCalledTimes(1);
    expect(mockCreateChatCompletion).toHaveBeenCalledTimes(1);
  });

  it("chatService: input bloklanganda LLM chaqirilmaydi", async () => {
    mockFilterChildInput.mockResolvedValue({
      allowed: false,
      crisis: false,
      content: "Bu mavzu hozircha mos emas.",
      eventLogged: true,
    });

    const { sendMessage } = await import("@/lib/ai/chatService");

    const result = await sendMessage({
      childId: "child-1",
      message: "xavfli so'rov",
      age: 9,
      name: "Ali",
      language: "uz",
    });

    expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    expect(mockFilterAiOutput).not.toHaveBeenCalled();
    expect(result.filtered).toBe(true);
  });

  it("chatService: inqirozda LLM chaqirilmaydi, crisis=true", async () => {
    mockFilterChildInput.mockResolvedValue({
      allowed: false,
      crisis: true,
      content: "Ota-onang yoki 112 ga murojaat qil.",
      eventLogged: true,
    });

    const { sendMessage } = await import("@/lib/ai/chatService");

    const result = await sendMessage({
      childId: "child-1",
      message: "o'zimni o'ldirmoqchiman",
      age: 9,
      name: "Ali",
      language: "uz",
    });

    expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    expect(result.crisis).toBe(true);
  });

  it("figureService: input + output filter chaqiriladi", async () => {
    const { sendFigureMessage } = await import("@/lib/rag/figureService");

    await sendFigureMessage({
      slug: "mirzo-ulugbek",
      childId: "child-1",
      message: "Rasadxonang qayerda?",
      age: 10,
      name: "Zara",
      language: "uz",
    });

    expect(mockFilterChildInput).toHaveBeenCalledTimes(1);
    expect(mockFilterAiOutput).toHaveBeenCalledTimes(1);
  });

  it("figureService: RAG bo'sh bo'lsa LLM chaqirilmaydi", async () => {
    mockGetAllomaContext.mockResolvedValue({
      allomaId: "mirzo-ulugbek",
      slug: "mirzo-ulugbek",
      figureName: "Mirzo Ulug'bek",
      question: "test",
      context: "",
      chunks: [],
      sources: [],
      found: false,
    });

    const { sendFigureMessage } = await import("@/lib/rag/figureService");

    const result = await sendFigureMessage({
      slug: "mirzo-ulugbek",
      childId: "child-1",
      message: "Noma'lum savol",
      age: 10,
      name: "Zara",
      language: "uz",
    });

    expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    expect(result.grounded).toBe(true);
    expect(result.sources).toEqual([]);
  });

  it("figureService: chiqish filter LLM javobidan keyin ishlaydi", async () => {
    mockCreateChatCompletion.mockResolvedValue({ content: "Xavfli LLM javob" });
    mockFilterAiOutput.mockResolvedValue({
      allowed: false,
      crisis: false,
      content: "Bu mavzu hozircha mos emas.",
      eventLogged: true,
    });

    const { sendFigureMessage } = await import("@/lib/rag/figureService");

    const result = await sendFigureMessage({
      slug: "mirzo-ulugbek",
      childId: "child-1",
      message: "Rasadxonang haqida",
      age: 10,
      name: "Zara",
      language: "uz",
    });

    expect(mockFilterAiOutput).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Xavfli LLM javob" })
    );
    expect(result.filtered).toBe(true);
    expect(result.reply).toBe("Bu mavzu hozircha mos emas.");
  });
});
