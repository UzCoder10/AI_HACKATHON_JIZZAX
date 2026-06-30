import { createHash } from "node:crypto";
import { describe, it, expect, vi } from "vitest";
import { verifyClickSignature } from "./webhookVerify";
import { PLANS, FREE_FIGURE_SLUGS } from "./plans";
import { checkFigureAccess } from "./limits";

vi.mock("@/lib/env", () => ({
  env: {
    payments: {
      click: { secretKey: "test-secret" },
      payme: { merchantId: "m", secretKey: "s", testMode: true },
    },
    appUrl: "http://localhost:3001",
  },
}));

describe("verifyClickSignature", () => {
  it("to'g'ri imzoni qabul qiladi", () => {
    const params = {
      clickTransId: "123",
      serviceId: "456",
      merchantTransId: "order-1",
      amount: "24000",
      action: "0",
      signTime: "1234567890",
    };
    const signString = createHash("md5")
      .update(
        params.clickTransId +
          params.serviceId +
          "test-secret" +
          params.merchantTransId +
          params.amount +
          params.action +
          params.signTime
      )
      .digest("hex");

    expect(
      verifyClickSignature({ ...params, signString })
    ).toBe(true);
  });

  it("noto'g'ri imzoni rad etadi", () => {
    expect(
      verifyClickSignature({
        clickTransId: "1",
        serviceId: "2",
        merchantTransId: "3",
        amount: "100",
        action: "0",
        signTime: "0",
        signString: "wrong",
      })
    ).toBe(false);
  });
});

describe("tarif cheklovlari", () => {
  it("bepul tarifda faqat 3 siymo", () => {
    expect(checkFigureAccess("free", "mirzo-ulugbek").allowed).toBe(true);
    expect(checkFigureAccess("free", "amir-temur").allowed).toBe(false);
    expect(FREE_FIGURE_SLUGS.length).toBe(3);
  });

  it("standart tarifda barcha shaxslar", () => {
    expect(checkFigureAccess("standard", "amir-temur").allowed).toBe(true);
  });

  it("bepul tarifda kunlik limit", () => {
    expect(PLANS.free.dailyChatLimit).toBe(15);
    expect(PLANS.standard.dailyChatLimit).toBeNull();
  });
});
