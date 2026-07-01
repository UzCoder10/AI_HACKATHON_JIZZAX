/** STT sifat metrikalari — ground truth bilan solishtirish */

export function normalizeSttText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`ʻʼ]/g, "'")
    .replace(/o['']/g, "o")
    .replace(/g['']/g, "g")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ground truth so'zlarining nechasi transkripsiyada topildi (0–1) */
export function wordRecall(groundTruth: string, transcribed: string): number {
  const truthWords = normalizeSttText(groundTruth).split(" ").filter(Boolean);
  if (truthWords.length === 0) return 0;
  const transWords = new Set(normalizeSttText(transcribed).split(" ").filter(Boolean));
  const hits = truthWords.filter((w) => transWords.has(w)).length;
  return hits / truthWords.length;
}

/** Taxminiy WER: (subst + insert + delete) / truth length — oddiy token moslik */
export function approximateWordErrorRate(groundTruth: string, transcribed: string): number {
  const a = normalizeSttText(groundTruth).split(" ").filter(Boolean);
  const b = normalizeSttText(transcribed).split(" ").filter(Boolean);
  if (a.length === 0) return b.length > 0 ? 1 : 0;

  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length] / a.length;
}

export function accuracyPercent(recall: number): number {
  return Math.round(recall * 1000) / 10;
}
