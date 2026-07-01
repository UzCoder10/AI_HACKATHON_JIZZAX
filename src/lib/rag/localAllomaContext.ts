import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { RagChunk } from "@/types/figures";

const DATA_ROOT = join(process.cwd(), "data", "allomalar");

/** Katalog slug → papka nomi */
const FOLDER_BY_SLUG: Record<string, string> = {
  "abu-rayhon-beruniy": "beruniy",
  beruniy: "beruniy",
  "abu-ali-ibn-sino": "ibn_sino",
  "ibn-sino": "ibn_sino",
  ibn_sino: "ibn_sino",
  "mirzo-ulugbek": "ulugbek",
  ulugbek: "ulugbek",
  "alisher-navoiy": "navoiy",
  navoiy: "navoiy",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`ʻʼ]/g, "'")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function questionTokens(question: string): Set<string> {
  const stop = new Set([
    "haqida", "qanday", "nima", "kim", "edi", "gapir", "ayt", "menga", "men",
    "salom", "va", "bir", "bu", "u", "the", "a",
  ]);
  return new Set(
    normalize(question)
      .split(" ")
      .filter((w) => w.length > 2 && !stop.has(w))
  );
}

function scoreParagraph(paragraph: string, tokens: Set<string>, question: string): number {
  if (tokens.size === 0) return 0;
  const normQ = normalize(question);
  const normP = normalize(paragraph);
  const words = normP.split(" ").filter(Boolean);
  const wordSet = new Set(words);
  let hits = 0;
  for (const t of tokens) {
    if (wordSet.has(t)) {
      hits += 1;
      continue;
    }
    const stem = t.slice(0, Math.min(5, t.length));
    if (words.some((w) => w.startsWith(stem) || stem.startsWith(w.slice(0, Math.min(5, w.length))))) {
      hits += 0.85;
    }
  }
  let score = hits / tokens.size;
  for (const kw of ["bemor", "davol", "yulduz", "rasadxona", "xamsa", "yer", "matematika", "shifokor", "kasal", "tuzala"]) {
    if (normQ.includes(kw) && normP.includes(kw)) score += 0.2;
  }
  return score;
}

/**
 * RAGFlow ishlamaganda data/allomalar/*.txt dan oddiy matn qidiruv.
 */
export function getLocalAllomaContext(
  slug: string,
  question: string,
  options: { topK?: number; maxChars?: number } = {}
): { chunks: RagChunk[]; sources: string[] } {
  const folder = FOLDER_BY_SLUG[slug];
  if (!folder) return { chunks: [], sources: [] };

  const dir = join(DATA_ROOT, folder);
  if (!existsSync(dir)) return { chunks: [], sources: [] };

  const tokens = questionTokens(question);
  const topK = options.topK ?? 3;
  const maxChars = options.maxChars ?? 2400;

  const scored: Array<{ score: number; content: string; source: string }> = [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".txt")) continue;
    // Eski test fayllar
    if (file.includes("astronomiya") && file === "beruniy-astronomiya.txt") continue;
    if (file === "ibn-sino-tibbiyot.txt") continue;

    const fullPath = join(dir, file);
    const raw = readFileSync(fullPath, "utf8");

    // Ibn Sino hikoyalari — har fayl bitta hikoya
    if (file.includes("hikoya")) {
      const rawScore = scoreParagraph(raw, tokens, question);
      const score = rawScore / Math.log10(raw.length + 200);
      scored.push({
        score,
        content: raw.trim().slice(0, 1200),
        source: `local:${file}`,
      });
      continue;
    }

    const paragraphs = raw.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length >= 80);

    for (const p of paragraphs) {
      const score = scoreParagraph(p, tokens, question);
      if (score > 0.05) {
        scored.push({ score, content: p, source: `local:${file}` });
      }
    }

    // Hech qanday mos paragraf topilmasa — fayl boshidan qisqa parcha
    if (paragraphs.length > 0 && scored.every((s) => s.source !== `local:${file}`)) {
      scored.push({
        score: 0.01,
        content: paragraphs[0].slice(0, 600),
        source: `local:${file}`,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const chunks: RagChunk[] = [];
  const sources: string[] = [];
  let totalChars = 0;

  for (const item of scored) {
    if (chunks.length >= topK || totalChars >= maxChars) break;
    chunks.push({
      content: item.content,
      source: item.source,
      score: item.score,
    });
    if (!sources.includes(item.source)) sources.push(item.source);
    totalChars += item.content.length;
  }

  return { chunks, sources };
}

export function isLocalAllomaDataAvailable(slug: string): boolean {
  const folder = FOLDER_BY_SLUG[slug];
  if (!folder) return false;
  const dir = join(DATA_ROOT, folder);
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f.endsWith(".txt"));
}
