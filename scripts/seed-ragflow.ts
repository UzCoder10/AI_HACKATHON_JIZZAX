/**
 * RAGFlow ga Buyuk Siymolar matnlarini yuklash (bir martalik seed).
 *
 * Ishlatish:
 *   npm run ragflow:seed
 *   npm run ragflow:seed -- --create-dataset
 *   npm run ragflow:seed -- --verify-only
 *   npm run ragflow:seed -- --data-dir=./data/allomalar
 */
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

function loadEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
  }
}
loadEnv();

import { FIGURE_CATALOG } from "../src/lib/rag/figuresCatalog";
import {
  createKnowledgeBase,
  getKnowledgeBase,
  listDocuments,
  query,
  uploadDocument,
  waitForDocumentsParsed,
} from "../src/lib/rag/ragflowAdminClient";

const ALLOWED_EXT = new Set([".txt", ".md", ".pdf"]);

/** Papka nomi → FIGURE_CATALOG slug */
const FOLDER_TO_SLUG: Record<string, string> = {
  beruniy: "abu-rayhon-beruniy",
  "abu-rayhon-beruniy": "abu-rayhon-beruniy",
  ibn_sino: "ibn-sino",
  "ibn-sino": "ibn-sino",
  ulugbek: "mirzo-ulugbek",
  "mirzo-ulugbek": "mirzo-ulugbek",
  navoiy: "alisher-navoiy",
  "alisher-navoiy": "alisher-navoiy",
  xorazmiy: "al-xorazmiy",
  "al-xorazmiy": "al-xorazmiy",
  temur: "amir-temur",
  "amir-temur": "amir-temur",
  buxoriy: "imom-al-buxoriy",
  "imom-al-buxoriy": "imom-al-buxoriy",
};

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    createDataset: args.includes("--create-dataset"),
    verifyOnly: args.includes("--verify-only"),
    dataDir:
      args.find((a) => a.startsWith("--data-dir="))?.split("=")[1] ??
      join(process.cwd(), "data", "allomalar"),
  };
}

function resolveFigure(folderName: string) {
  const slug = FOLDER_TO_SLUG[folderName.toLowerCase()] ?? folderName;
  return FIGURE_CATALOG.find((f) => f.slug === slug) ?? null;
}

function collectFiles(dataDir: string): Array<{ folder: string; path: string }> {
  if (!existsSync(dataDir)) {
    console.error(`Papka topilmadi: ${dataDir}`);
    process.exit(1);
  }

  const entries = readdirSync(dataDir, { withFileTypes: true });
  const files: Array<{ folder: string; path: string }> = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const folderPath = join(dataDir, entry.name);
    for (const file of readdirSync(folderPath)) {
      const ext = extname(file).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) continue;
      const full = join(folderPath, file);
      if (statSync(full).isFile()) {
        files.push({ folder: entry.name, path: full });
      }
    }
  }

  return files;
}

async function resolveDatasetId(createDataset: boolean): Promise<string> {
  const existingId = process.env.RAGFLOW_DATASET_ID?.trim();

  if (existingId && !createDataset) {
    const kb = await getKnowledgeBase(existingId);
    if (kb) {
      console.log(`Mavjud KB ishlatiladi: "${kb.name}" (${kb.id})`);
      return kb.id;
    }
    console.warn(`RAGFLOW_DATASET_ID topilmadi, yangi yaratiladi...`);
  }

  const kb = await createKnowledgeBase("Nihol — Buyuk Siymolar", {
    description:
      "O'zbek allomalari (Beruniy, Ibn Sino, ...) — bolalar AI suhbati uchun manba bazasi",
    embeddingModel: process.env.RAGFLOW_EMBEDDING_MODEL || undefined,
  });

  console.log(`Yangi KB yaratildi: "${kb.name}"`);
  console.log(`  ID: ${kb.id}`);
  console.log(`  .env ga qo'shing: RAGFLOW_DATASET_ID=${kb.id}`);
  return kb.id;
}

async function main() {
  const { createDataset, verifyOnly, dataDir } = parseArgs();

  if (!process.env.RAGFLOW_API_URL || !process.env.RAGFLOW_API_KEY) {
    console.error("RAGFLOW_API_URL va RAGFLOW_API_KEY .env da kerak");
    process.exit(1);
  }

  const datasetId = await resolveDatasetId(createDataset);

  if (verifyOnly) {
    console.log("\n=== SINOV (verify-only) ===");
    await runVerification(datasetId);
    return;
  }

  const files = collectFiles(dataDir);
  if (files.length === 0) {
    console.error(`Hujjat topilmadi: ${dataDir}/*/*.{txt,md,pdf}`);
    process.exit(1);
  }

  console.log(`\n${files.length} ta fayl topildi, yuklanmoqda...\n`);

  const uploadedIds: string[] = [];

  for (const { folder, path } of files) {
    const figure = resolveFigure(folder);
    if (!figure) {
      console.warn(`  [SKIP] Noma'lum papka: ${folder} (${path})`);
      continue;
    }

    process.stdout.write(`  ↑ ${figure.nameUz} / ${path.split(/[/\\]/).pop()} ... `);
    try {
      const result = await uploadDocument(
        datasetId,
        path,
        {
          figure_slug: figure.slug,
          figure_name_uz: figure.nameUz,
          figure_name_ru: figure.nameRu,
          source: folder,
        },
        { autoParse: true }
      );
      uploadedIds.push(result.documentId);
      console.log(`OK (${result.documentId})`);
    } catch (err) {
      console.log("XATO");
      console.error("   ", err instanceof Error ? err.message : err);
    }
  }

  if (uploadedIds.length > 0) {
    console.log(`\nParse kutilmoqda (${uploadedIds.length} hujjat)...`);
    const parsed = await waitForDocumentsParsed(datasetId, uploadedIds);
    for (const doc of parsed) {
      console.log(`  ✓ ${doc.name} — ${doc.chunkNum ?? "?"} chunk (${doc.run})`);
    }
  }

  const allDocs = await listDocuments(datasetId);
  const kb = await getKnowledgeBase(datasetId);

  console.log("\n=== YUKLASH XULOSASI ===");
  console.log(`KB: ${kb?.name ?? datasetId}`);
  console.log(`Hujjatlar: ${allDocs.length} (jami chunk: ${kb?.chunkCount ?? "?"})`);
  allDocs.forEach((d) => {
    console.log(`  - ${d.name} | chunks: ${d.chunkNum ?? 0} | ${d.run ?? "?"}`);
  });

  await runVerification(datasetId);
}

async function runVerification(datasetId: string) {
  const testQuestion = "Beruniy astronomiya haqida nima degan?";
  console.log(`\n=== RETRIEVAL SINOVI ===`);
  console.log(`Savol: "${testQuestion}"\n`);

  try {
    const result = await query(datasetId, testQuestion, {
      topK: 3,
      figureKeyword: "Abu Rayhon Beruniy",
      similarityThreshold: 0.2,
    });

    if (result.chunks.length === 0) {
      console.log("⚠ Mos parcha topilmadi. Embedding model yoki matn hajmini tekshiring.");
      return;
    }

    result.chunks.forEach((c, i) => {
      console.log(`--- Parcha ${i + 1} (score: ${c.score.toFixed(3)}) ---`);
      console.log(`Manba: ${c.source}`);
      console.log(c.content.slice(0, 400) + (c.content.length > 400 ? "..." : ""));
      console.log();
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("⚠ Retrieval xatolik (hujjatlar yuklangan, lekin qidiruv ishlamadi):");
    console.log(`  ${msg}`);
    if (msg.includes("not authorized") || msg.includes("@None")) {
      console.log("\n  Yechim: RAGFlow UI → Dataset → Embedding model tanlang");
      console.log("  yoki: npm run ragflow:seed -- --create-dataset");
      console.log("  va RAGFLOW_EMBEDDING_MODEL ni serverdagi model bilan moslang.");
    }
  }
}

main().catch((err) => {
  console.error("\nFATAL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
