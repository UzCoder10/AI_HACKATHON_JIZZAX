import { describe, it, expect, vi } from "vitest";
import { extractInterests } from "./interestExtractor";

vi.mock("@/lib/ai/alemClient", () => ({
  createChatCompletion: vi.fn().mockResolvedValue({
    content: '{"interests":[{"topic":"astronomiya","confidence":"medium","evidence":"statistika"}]}',
  }),
}));

describe("extractInterests", () => {
  it("ota-onaga so'zma-so'z matn emas — faqat umumlashtirilgan mavzu", async () => {
    const secretMessage = "Men maktabda juda xafa bo'ldim va hech kimga aytmadim";

    const result = await extractInterests(
      [
        {
          content: secretMessage,
          createdAt: new Date(),
          conversation: {
            mode: "GREAT_FIGURE",
            figure: { slug: "mirzo-ulugbek", nameUz: "Mirzo Ulug'bek", field: "astronomiya" },
          },
        },
        {
          content: secretMessage,
          createdAt: new Date(),
          conversation: {
            mode: "GREAT_FIGURE",
            figure: { slug: "mirzo-ulugbek", nameUz: "Mirzo Ulug'bek", field: "astronomiya" },
          },
        },
        {
          content: "yulduzlar haqida",
          createdAt: new Date(),
          conversation: { mode: "STANDARD", figure: null },
        },
      ],
      "uz"
    );

    for (const interest of result.interests) {
      expect(interest.evidence).not.toContain(secretMessage);
      expect(interest.topic).not.toContain("xafa bo'ldim");
    }

    expect(result.interests.length).toBeGreaterThan(0);
  });
});
