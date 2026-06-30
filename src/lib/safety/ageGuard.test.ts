import { describe, it, expect } from "vitest";
import { getAgeRegister, getAgeGuardConfig } from "./ageGuard";

describe("ageGuard", () => {
  it("7-8 yosh uchun simple registr", () => {
    expect(getAgeRegister(7)).toBe("simple");
    expect(getAgeRegister(8)).toBe("simple");
  });

  it("9-10 yosh uchun moderate registr", () => {
    expect(getAgeRegister(9)).toBe("moderate");
    expect(getAgeRegister(10)).toBe("moderate");
  });

  it("11-12 yosh uchun advanced registr", () => {
    expect(getAgeRegister(11)).toBe("advanced");
    expect(getAgeRegister(12)).toBe("advanced");
  });

  it("simple registr qisqa gap chegarasiga ega", () => {
    const config = getAgeGuardConfig(7);
    expect(config.maxSentenceWords).toBeLessThanOrEqual(15);
    expect(config.systemHint).toContain("sodda");
  });
});
