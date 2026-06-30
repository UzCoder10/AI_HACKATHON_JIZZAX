import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("API kalitlar kodda yo'q", () => {
  const srcDir = join(process.cwd(), "src");
  const patterns = [
    /sk-[a-zA-Z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /PAYME_SECRET_KEY\s*=\s*["'][^"']+["']/,
    /ALEMLLM_API_KEY\s*=\s*["'][^"']+["']/,
  ];

  const filesToScan = [
    "lib/env.ts",
    "lib/ai/alemClient.ts",
    "lib/payments/webhookVerify.ts",
    "lib/payments/paymeClient.ts",
    "lib/payments/clickClient.ts",
  ];

  for (const file of filesToScan) {
    it(`${file} da hardcode kalit yo'q`, () => {
      const content = readFileSync(join(srcDir, file), "utf-8");
      for (const pattern of patterns) {
        expect(content).not.toMatch(pattern);
      }
      expect(content).not.toMatch(/apiKey:\s*["'][a-zA-Z0-9]{8,}["']/);
    });
  }
});
