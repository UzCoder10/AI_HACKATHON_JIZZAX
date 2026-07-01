import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RagChunk } from "@/types/figures";

vi.mock("@/lib/rag/ragflowAdminClient", () => ({
  query: vi.fn(),
}));

vi.mock("@/lib/rag/ragflowHttp", () => ({
  isRagflowAdminConfigured: vi.fn(() => true),
}));

import { query } from "@/lib/rag/ragflowAdminClient";
import { isRagflowAdminConfigured } from "@/lib/rag/ragflowHttp";
import {
  buildAllomaContextText,
  getAllomaContext,
  get_alloma_context,
} from "./allomaContext";
import { resolveAllomaSlug } from "./allomaIds";

const mockQuery = vi.mocked(query);
const mockConfigured = vi.mocked(isRagflowAdminConfigured);

describe("resolveAllomaSlug", () => {
  it("qisqa id ni slug ga aylantiradi", () => {
    expect(resolveAllomaSlug("beruniy")).toBe("abu-rayhon-beruniy");
    expect(resolveAllomaSlug("ibn_sino")).toBe("ibn-sino");
  });
});

describe("buildAllomaContextText", () => {
  it("manba nomi bilan birlashtiradi", () => {
    const chunks: RagChunk[] = [
      { content: "Yulduzlar haqida matn", source: "beruniy.txt", score: 0.8 },
    ];
    const text = buildAllomaContextText(chunks);
    expect(text).toContain("[Manba 1: beruniy.txt]");
    expect(text).toContain("Yulduzlar");
  });
});

describe("getAllomaContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAGFLOW_DATASET_ID = "test-dataset-id";
    mockConfigured.mockReturnValue(true);
  });

  it("mos parchalarni kontekstga aylantiradi", async () => {
    mockQuery.mockResolvedValue({
      chunks: [
        {
          content: "Beruniy yulduzlar jadvalini tuzgan",
          source: "beruniy-astronomiya.txt",
          score: 0.85,
        },
      ],
      query: "Abu Rayhon Beruniy: yulduzlar",
      total: 1,
    });

    const result = await getAllomaContext("beruniy", "yulduzlar haqida");

    expect(result.found).toBe(true);
    expect(result.slug).toBe("abu-rayhon-beruniy");
    expect(result.context).toContain("yulduzlar jadvalini");
    expect(mockQuery).toHaveBeenCalledWith(
      "test-dataset-id",
      "yulduzlar haqida",
      expect.objectContaining({
        figureKeyword: "Abu Rayhon Beruniy",
        metadataCondition: { figure_slug: "abu-rayhon-beruniy" },
      })
    );
  });

  it("parcha topilmasa found=false", async () => {
    mockQuery.mockResolvedValue({ chunks: [], query: "test", total: 0 });

    const result = await getAllomaContext("beruniy", "noma'lum mavzu");

    expect(result.found).toBe(false);
    expect(result.context).toBe("");
  });

  it("RAGFlow xatoligida tizim qulamaydi", async () => {
    mockQuery.mockRejectedValue(new Error("Connection refused"));

    const result = await get_alloma_context("beruniy", "yulduzlar");

    expect(result.found).toBe(false);
    expect(result.error).toContain("RAGFlow");
  });

  it("noma'lum alloma uchun xato qaytaradi", async () => {
    const result = await getAllomaContext("noma-lum", "savol");
    expect(result.found).toBe(false);
    expect(result.error).toContain("Noma'lum alloma");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
