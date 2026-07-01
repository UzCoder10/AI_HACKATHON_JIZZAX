import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTranscribeWithProvider = vi.fn();
const mockGetSttProvider = vi.fn();
const mockIsSttConfigured = vi.fn();
const mockSynthesizeSpeech = vi.fn();
const mockAskAlloma = vi.fn();
const mockIsOpenAiConfigured = vi.fn();

vi.mock("@/lib/voice/stt", () => ({
  transcribeWithProvider: (...args: unknown[]) => mockTranscribeWithProvider(...args),
  getSttProvider: () => mockGetSttProvider(),
  isSttConfigured: () => mockIsSttConfigured(),
}));

vi.mock("@/lib/llm", () => ({
  synthesizeSpeech: (...args: unknown[]) => mockSynthesizeSpeech(...args),
  isOpenAiConfigured: () => mockIsOpenAiConfigured(),
}));

vi.mock("@/lib/rag/askAlloma", () => ({
  askAlloma: (...args: unknown[]) => mockAskAlloma(...args),
}));

import { resolveAudioMimeType, sttUploadFilename } from "@/lib/voice/audioValidation";
import { transcribeVoiceAudio, VoiceError } from "@/lib/voice/transcribeService";
import { synthesizeAllomaSpeech } from "@/lib/voice/ttsService";
import { runAllomaVoiceChat } from "@/lib/voice/voiceService";
import { getAllomaVoice } from "@/lib/voice/allomaVoices";

describe("getAllomaVoice", () => {
  it("har alloma uchun turli ovoz", () => {
    expect(getAllomaVoice("beruniy")).toBe("onyx");
    expect(getAllomaVoice("navoiy")).toBe("shimmer");
    expect(getAllomaVoice("ulugbek")).not.toBe(getAllomaVoice("beruniy"));
  });
});

describe("sttUploadFilename", () => {
  it("MIME ga mos kengaytma beradi", () => {
    expect(sttUploadFilename("audio/wav", "recording.webm")).toBe("recording.wav");
    expect(sttUploadFilename("audio/webm")).toBe("recording.webm");
  });
});

describe("resolveAudioMimeType", () => {
  it("video/webm ni audio/webm ga aylantiradi (Muxlisa STT)", () => {
    expect(resolveAudioMimeType("video/webm")).toBe("audio/webm");
    expect(resolveAudioMimeType("video/webm;codecs=opus")).toBe("audio/webm");
  });
});

describe("transcribeVoiceAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSttConfigured.mockReturnValue(true);
    mockGetSttProvider.mockReturnValue("openai");
  });

  it("video/webm ni Muxlisa uchun audio/webm sifatida yuboradi", async () => {
    mockTranscribeWithProvider.mockResolvedValue({
      text: "Salom",
      provider: "muxlisa",
      latencyMs: 80,
    });
    mockGetSttProvider.mockReturnValue("muxlisa");

    const audio = Buffer.alloc(2048, 1);
    await transcribeVoiceAudio(audio, { mimeType: "video/webm" });

    expect(mockTranscribeWithProvider).toHaveBeenCalledWith(
      "muxlisa",
      audio,
      expect.objectContaining({ mimeType: "audio/webm" })
    );
  });

  it("o'zbek tilida STT chaqiradi", async () => {
    mockTranscribeWithProvider.mockResolvedValue({
      text: "Yulduzlar haqida gapir",
      provider: "openai",
      latencyMs: 100,
    });

    const audio = Buffer.alloc(2048, 1);
    const result = await transcribeVoiceAudio(audio, { language: "uz", mimeType: "audio/mpeg" });

    expect(result.text).toContain("Yulduzlar");
    expect(mockTranscribeWithProvider).toHaveBeenCalledWith(
      "openai",
      audio,
      expect.objectContaining({ mimeType: expect.any(String) })
    );
  });

  it("bo'sh audio rad etiladi", async () => {
    await expect(transcribeVoiceAudio(Buffer.alloc(0))).rejects.toMatchObject({
      code: "invalid_audio",
    });
  });

  it("bo'sh transkripsiya tushunarli xato", async () => {
    mockTranscribeWithProvider.mockResolvedValue({
      text: " ",
      provider: "openai",
      latencyMs: 50,
    });
    const audio = Buffer.alloc(2048, 1);

    await expect(
      transcribeVoiceAudio(audio, { mimeType: "audio/webm" })
    ).rejects.toMatchObject({ code: "empty_transcript" });
  });
});

describe("synthesizeAllomaSpeech", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpenAiConfigured.mockReturnValue(true);
    mockSynthesizeSpeech.mockResolvedValue(Buffer.from("mp3-bytes"));
  });

  it("alloma ovozini tanlaydi", async () => {
    const result = await synthesizeAllomaSpeech("Salom bolalar", "beruniy");

    expect(result.voice).toBe("onyx");
    expect(result.mimeType).toBe("audio/mpeg");
    expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
      "Salom bolalar",
      expect.objectContaining({ voice: "onyx", format: "mp3" })
    );
  });
});

describe("runAllomaVoiceChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpenAiConfigured.mockReturnValue(true);
    mockIsSttConfigured.mockReturnValue(true);
    mockGetSttProvider.mockReturnValue("openai");
    mockTranscribeWithProvider.mockResolvedValue({
      text: "Yulduzlar haqida gapir",
      provider: "openai",
      latencyMs: 100,
    });
    mockAskAlloma.mockResolvedValue({
      allomaId: "beruniy",
      slug: "abu-rayhon-beruniy",
      figureName: "Abu Rayhon Beruniy",
      reply: "Men Beruniyman. Yulduzlar haqida gapiraman.",
      sessionId: "sess-1",
      filtered: false,
      crisis: false,
      grounded: true,
      sources: ["beruniy.txt"],
    });
    mockSynthesizeSpeech.mockResolvedValue(Buffer.from("reply-mp3"));
  });

  it("to'liq oqim: STT → askAlloma → TTS", async () => {
    const audio = Buffer.alloc(4096, 2);
    const result = await runAllomaVoiceChat({
      allomaId: "beruniy",
      audio,
      childId: "child-1",
      age: 11,
      language: "uz",
    });

    expect(result.questionText).toBe("Yulduzlar haqida gapir");
    expect(result.reply).toContain("Beruniy");
    expect(result.audioBase64).toBeTruthy();
    expect(result.timings.totalMs).toBeGreaterThanOrEqual(0);
    expect(mockAskAlloma).toHaveBeenCalledWith(
      expect.objectContaining({ question: "Yulduzlar haqida gapir" })
    );
  });

  it("TTS xatoligida ham matn qaytadi", async () => {
    mockSynthesizeSpeech.mockRejectedValue(new Error("TTS down"));
    const audio = Buffer.alloc(4096, 2);

    const result = await runAllomaVoiceChat({
      allomaId: "beruniy",
      audio,
      childId: "child-1",
      age: 11,
      language: "uz",
    });

    expect(result.reply).toContain("Beruniy");
    expect(result.audioBase64).toBe("");
  });
});

describe("VoiceError", () => {
  it("kod bilan ishlaydi", () => {
    const err = new VoiceError("test", "invalid_audio");
    expect(err.code).toBe("invalid_audio");
  });
});
