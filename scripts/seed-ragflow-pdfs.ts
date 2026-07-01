/**
 * PDF manbalardan tozalangan lotin matn yaratish va RAGFlow ga yuklash.
 *
 * Ishlatish:
 *   npm run ragflow:seed-pdfs                    # tozalash + tayyorlash + yuklash + test
 *   npm run ragflow:seed-pdfs -- --prepare-only  # faqat data/allomalar ga txt yozish
 *   npm run ragflow:seed-pdfs -- --upload-only   # mavjud txt larni yuklash
 *   npm run ragflow:seed-pdfs -- --test-only     # 4 ta sinov savoli
 *   npm run ragflow:seed-pdfs -- --create-dataset
 *   npm run ragflow:seed-pdfs -- --dual-script   # kirill+lotin ikkalasini ham (ixtiyoriy)
 *
 * Alifbo: default — faqat lotin indeks (tavsiya). --dual-script ikkala variantni ham yuklaydi.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { join, basename } from "path";
import { cyrillicRatio, normalizeForRagIndex, transliterateCyrillicToLatin } from "../src/lib/rag/uzbekTransliterate";
import {
  cleanExtractedText,
  splitByParagraphs,
  splitIbnSinoStories,
} from "../src/lib/rag/textClean";
import {
  createKnowledgeBase,
  deleteAllDocuments,
  deleteKnowledgeBase,
  getKnowledgeBase,
  listDocuments,
  listKnowledgeBases,
  query,
  uploadDocument,
  waitForDocumentsParsed,
} from "../src/lib/rag/ragflowAdminClient";
import { extractTextFromFile } from "./lib/pdfExtract";

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

const PDF_BASE =
  process.env.RAGFLOW_PDF_DIR?.trim() ||
  "C:\\Users\\User\\Downloads\\Telegram Desktop";

const OUT_DIR = join(process.cwd(), "data", "allomalar");

type ChunkMode = "paragraph" | "stories";

interface SourceFile {
  file: string;
  label?: string;
  chunkMode?: ChunkMode;
}

interface FigureManifest {
  folder: string;
  figure_slug: string;
  figure_name_uz: string;
  figure_name_ru: string;
  chunkMode: ChunkMode;
  sources: SourceFile[];
}

const MANIFEST: FigureManifest[] = [
  {
    folder: "beruniy",
    figure_slug: "abu-rayhon-beruniy",
    figure_name_uz: "Abu Rayhon Beruniy",
    figure_name_ru: "Абу Райхон Бeruniy",
    chunkMode: "paragraph",
    sources: [
      { file: "abu-rayhon-beruniyning-hayoti-va-ijodi.pdf", label: "hayoti-ijodi" },
      { file: "beruniy hayoti 2.pdf", label: "hayoti-2" },
      { file: "Hindiston - Abu Rayhon Beruniy.pdf", label: "hindiston" },
    ],
  },
  {
    folder: "ibn_sino",
    figure_slug: "abu-ali-ibn-sino",
    figure_name_uz: "Abu Ali ibn Sino",
    figure_name_ru: "Абу Али ибн Сино",
    chunkMode: "stories",
    sources: [
      { file: "abu ali inbn sino .pdf", label: "hikoyalar", chunkMode: "stories" },
      { file: "tib_qonunlari_2_ziyouz_com.pdf", label: "tib-qonunlari", chunkMode: "paragraph" },
      { file: "tib_qonunlari1_ziyouz_com.zip", label: "tib-qonunlari-1", chunkMode: "paragraph" },
      { file: "tib_qonunlari3_ziyouz_com.zip", label: "tib-qonunlari-3", chunkMode: "paragraph" },
    ],
  },
  {
    folder: "ulugbek",
    figure_slug: "mirzo-ulugbek",
    figure_name_uz: "Mirzo Ulug'bek",
    figure_name_ru: "Мирzo Ulug'bek",
    chunkMode: "paragraph",
    sources: [
      { file: "Mirzo Ulug'bek.pdf", label: "biografiya" },
      { file: "Mirzo Ulug'bek. To'rt ulus tarixi.pdf", label: "tort-ulus-tarixi" },
    ],
  },
  {
    folder: "navoiy",
    figure_slug: "alisher-navoiy",
    figure_name_uz: "Alisher Navoiy",
    figure_name_ru: "Алишер Navoiy",
    chunkMode: "paragraph",
    sources: [
      { file: "alisher navoiy biografiya.pdf", label: "biografiya" },
      { file: "Alisher Navoiy. Lisonut-tayr (nasriy bayoni).pdf", label: "lisonut-tayr" },
    ],
  },
];

const TEST_QUESTIONS = [
  {
    allomaId: "beruniy",
    figure_name_uz: "Abu Rayhon Beruniy",
    figure_slug: "abu-rayhon-beruniy",
    question: "Yer haqida nima kashf qilgan?",
  },
  {
    allomaId: "ibn_sino",
    figure_name_uz: "Abu Ali ibn Sino",
    figure_slug: "abu-ali-ibn-sino",
    question: "Bemorni qanday davolagan?",
  },
  {
    allomaId: "ulugbek",
    figure_name_uz: "Mirzo Ulug'bek",
    figure_slug: "mirzo-ulugbek",
    question: "Rasadxona haqida gapir",
  },
  {
    allomaId: "navoiy",
    figure_name_uz: "Alisher Navoiy",
    figure_slug: "alisher-navoiy",
    question: "Xamsa haqida ayt",
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    createDataset: args.includes("--create-dataset"),
    prepareOnly: args.includes("--prepare-only"),
    uploadOnly: args.includes("--upload-only"),
    testOnly: args.includes("--test-only"),
    dualScript: args.includes("--dual-script"),
    skipCleanup: args.includes("--skip-cleanup"),
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

interface PreparedDoc {
  figure: FigureManifest;
  outPath: string;
  fileName: string;
  script: "latin" | "cyrillic" | "mixed";
  charCount: number;
}

async function processSource(
  figure: FigureManifest,
  source: SourceFile,
  dualScript: boolean
): Promise<PreparedDoc[]> {
  const srcPath = join(PDF_BASE, source.file);
  if (!existsSync(srcPath)) {
    console.warn(`  [SKIP] Topilmadi: ${source.file}`);
    return [];
  }

  console.log(`  📄 ${source.file} ...`);
  const raw = await extractTextFromFile(srcPath);
  const cleaned = cleanExtractedText(raw);
  if (cleaned.length < 400) {
    console.warn(`  [SKIP] Juda kam matn (${cleaned.length} belgi) — ehtimol skan/OCR kerak: ${source.file}`);
    return [];
  }
  const ratio = cyrillicRatio(cleaned);
  const script: PreparedDoc["script"] =
    ratio > 0.35 ? "cyrillic" : ratio > 0.05 ? "mixed" : "latin";

  const outFolder = join(OUT_DIR, figure.folder);
  mkdirSync(outFolder, { recursive: true });

  const docs: PreparedDoc[] = [];

  function writeDoc(suffix: string, content: string, tag: string) {
    const fileName = `${source.label ?? slugify(source.file)}-${suffix}.txt`;
    const outPath = join(outFolder, fileName);
    writeFileSync(outPath, content, "utf8");
    docs.push({
      figure,
      outPath,
      fileName,
      script: tag === "cyr" ? "cyrillic" : "latin",
      charCount: content.length,
    });
  }

  const latin = normalizeForRagIndex(cleaned);
  const chunkMode = source.chunkMode ?? figure.chunkMode;

  if (chunkMode === "stories") {
    const stories = splitIbnSinoStories(latin);
    for (let i = 0; i < stories.length; i += 1) {
      const s = stories[i];
      writeDoc(`hikoya-${i + 1}-${slugify(s.title)}`, s.body, "lat");
    }
    if (dualScript && script !== "latin") {
      const cyrStories = splitIbnSinoStories(cleaned);
      for (let i = 0; i < cyrStories.length; i += 1) {
        writeDoc(`hikoya-${i + 1}-cyr`, cyrStories[i].body, "cyr");
      }
    }
    return docs;
  }

  // Ilmiy matn — har bir manba bitta to'liq hujjat (paragraf delimiter bilan)
  writeDoc("lat", latin, "lat");
  if (dualScript && script !== "latin") {
    writeDoc("cyr", cleaned, "cyr");
  }

  return docs;
}

async function prepareAll(dualScript: boolean): Promise<PreparedDoc[]> {
  console.log("\n=== 1. PDF → TOZALANGAN LOTIN MATN ===\n");
  console.log(`Manba papka: ${PDF_BASE}`);
  console.log(`Chiqish: ${OUT_DIR}\n`);

  const all: PreparedDoc[] = [];
  for (const figure of MANIFEST) {
    console.log(`\n📚 ${figure.figure_name_uz} (${figure.figure_slug})`);
    for (const source of figure.sources) {
      const docs = await processSource(figure, source, dualScript);
      all.push(...docs);
    }
  }

  console.log(`\n✓ Tayyorlandi: ${all.length} ta hujjat, jami ${all.reduce((s, d) => s + d.charCount, 0).toLocaleString()} belgi`);
  return all;
}

async function cleanupOldData(datasetId: string) {
  console.log("\n=== 0. ESKI TEST MA'LUMOTLARNI TOZALASH ===\n");

  // Lokal test fayllar
  const testFiles = [
    join(OUT_DIR, "beruniy", "beruniy-astronomiya.txt"),
    join(OUT_DIR, "ibn_sino", "ibn-sino-tibbiyot.txt"),
  ];
  for (const f of testFiles) {
    if (existsSync(f)) {
      rmSync(f);
      console.log(`  🗑 O'chirildi: ${f}`);
    }
  }

  // RAGFlow dataset hujjatlari
  const removed = await deleteAllDocuments(datasetId);
  console.log(`  🗑 Dataset hujjatlari o'chirildi: ${removed} ta`);

  // safarai_tourism va boshqa test KB
  const kbs = await listKnowledgeBases(1, 100);
  for (const kb of kbs) {
    const name = kb.name.toLowerCase();
    if (
      name.includes("safarai_tourism") ||
      name.includes("tourism") ||
      (name.includes("test") && kb.id !== datasetId)
    ) {
      console.log(`  🗑 Test KB o'chirilmoqda: "${kb.name}" (${kb.id})`);
      try {
        await deleteKnowledgeBase(kb.id);
      } catch (err) {
        console.warn(`     Xato: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
}

async function resolveDatasetId(createDataset: boolean): Promise<string> {
  if (createDataset) {
    const kb = await createKnowledgeBase("Nihol — Buyuk Siymolar KB", {
      description: "Beruniy, Ibn Sino, Ulug'bek, Navoiy — tozalangan lotin matnlar",
      embeddingModel: process.env.RAGFLOW_EMBEDDING_MODEL || undefined,
    });
    console.log(`\n✓ Yangi KB: ${kb.name}`);
    console.log(`  RAGFLOW_DATASET_ID=${kb.id}`);
    return kb.id;
  }

  const id = process.env.RAGFLOW_DATASET_ID?.trim();
  if (!id) throw new Error("RAGFLOW_DATASET_ID kerak yoki --create-dataset bering");
  const kb = await getKnowledgeBase(id);
  console.log(`KB: ${kb?.name ?? id}`);
  return id;
}

async function uploadPrepared(prepared: PreparedDoc[], datasetId: string) {
  console.log("\n=== 2. RAGFlow GA YUKLASH ===\n");

  const removed = await deleteAllDocuments(datasetId);
  if (removed > 0) console.log(`  🗑 Oldingi hujjatlar o'chirildi: ${removed} ta\n`);

  const uploadedIds: string[] = [];
  for (const doc of prepared) {
    const uploadName = `${doc.figure.figure_slug}__${doc.fileName}`;
    process.stdout.write(`  ↑ ${doc.figure.figure_name_uz} / ${doc.fileName} ... `);
    try {
      const result = await uploadDocument(
        datasetId,
        doc.outPath,
        {
          figure_slug: doc.figure.figure_slug,
          figure_name_uz: doc.figure.figure_name_uz,
          figure_name_ru: doc.figure.figure_name_ru,
          source: doc.figure.folder,
          script: doc.script,
        },
        { autoParse: true, uploadName }
      );
      uploadedIds.push(result.documentId);
      console.log(`OK (${doc.charCount.toLocaleString()} belgi)`);
    } catch (err) {
      console.log("XATO");
      console.error("   ", err instanceof Error ? err.message : err);
    }
  }

  if (uploadedIds.length > 0) {
    console.log(`\nParse kutilmoqda (${uploadedIds.length} hujjat)...`);
    const parsed = await waitForDocumentsParsed(datasetId, uploadedIds, {
      timeoutMs: 900_000,
      allowFailures: true,
    });
    for (const d of parsed) {
      console.log(`  ✓ ${d.name} — ${d.chunkNum ?? "?"} chunk`);
    }
  }

  const kb = await getKnowledgeBase(datasetId);
  const allDocs = await listDocuments(datasetId, 1, 200);
  console.log("\n=== YUKLASH XULOSASI ===");
  console.log(`Hujjatlar: ${allDocs.length}, chunk: ${kb?.chunkCount ?? "?"}`);
  allDocs.forEach((d) => console.log(`  - ${d.name} | ${d.chunkNum ?? 0} chunk`));
}

function collectPreparedFromDisk(): PreparedDoc[] {
  const docs: PreparedDoc[] = [];
  for (const figure of MANIFEST) {
    const folder = join(OUT_DIR, figure.folder);
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder)) {
      if (!file.endsWith(".txt")) continue;
      const outPath = join(folder, file);
      docs.push({
        figure,
        outPath,
        fileName: file,
        script: file.includes("-cyr") ? "cyrillic" : "latin",
        charCount: readFileSync(outPath, "utf8").length,
      });
    }
  }
  return docs;
}

async function runTests(datasetId: string) {
  console.log("\n=== 3. RETRIEVAL SINOVI (4 alloma) ===\n");

  const results: Array<{
    alloma: string;
    question: string;
    found: boolean;
    topScore: number;
    preview: string;
    source: string;
  }> = [];

  for (const t of TEST_QUESTIONS) {
    process.stdout.write(`  ? ${t.allomaId}: "${t.question}" ... `);
    try {
      const result = await query(datasetId, t.question, {
        topK: 3,
        figureKeyword: t.figure_name_uz,
        similarityThreshold: 0.15,
        metadataCondition: { figure_slug: t.figure_slug },
      });

      const top = result.chunks[0];
      const found = Boolean(top);
      console.log(found ? `✓ score=${top!.score.toFixed(3)}` : "✗ topilmadi");

      results.push({
        alloma: t.allomaId,
        question: t.question,
        found,
        topScore: top?.score ?? 0,
        preview: top?.content.slice(0, 280) ?? "",
        source: top?.source ?? "",
      });

      if (top) {
        console.log(`     Manba: ${top.source}`);
        console.log(`     "${top.content.slice(0, 200).replace(/\n/g, " ")}..."\n`);
      } else {
        console.log("");
      }
    } catch (err) {
      console.log("XATO");
      console.error(`     ${err instanceof Error ? err.message : err}\n`);
      results.push({
        alloma: t.allomaId,
        question: t.question,
        found: false,
        topScore: 0,
        preview: "",
        source: "",
      });
    }
  }

  const passed = results.filter((r) => r.found).length;
  console.log("=== SINOV XULOSASI ===");
  console.log(`O'tdi: ${passed}/${results.length}`);
  results.forEach((r) => {
    console.log(`  ${r.found ? "✓" : "✗"} ${r.alloma}: ${r.question} (score ${r.topScore.toFixed(3)})`);
  });

  return results;
}

async function main() {
  const { createDataset, prepareOnly, uploadOnly, testOnly, dualScript, skipCleanup } =
    parseArgs();

  if (!process.env.RAGFLOW_API_URL || !process.env.RAGFLOW_API_KEY) {
    console.error("RAGFLOW_API_URL va RAGFLOW_API_KEY kerak");
    process.exit(1);
  }

  const datasetId = await resolveDatasetId(createDataset);

  if (testOnly) {
    await runTests(datasetId);
    return;
  }

  if (!skipCleanup && !uploadOnly) {
    await cleanupOldData(datasetId);
  }

  let prepared: PreparedDoc[] = [];
  if (!uploadOnly) {
    prepared = await prepareAll(dualScript);
    if (prepareOnly) {
      console.log("\n--prepare-only: yuklash o'tkazib yuborildi.");
      return;
    }
  } else {
    prepared = collectPreparedFromDisk();
    if (prepared.length === 0) {
      console.error("Tayyor txt topilmadi. Avval --prepare-only ishga tushiring.");
      process.exit(1);
    }
  }

  await uploadPrepared(prepared, datasetId);
  await runTests(datasetId);

  console.log("\n=== ALIFBO YECHIMI ===");
  console.log("Tavsiya: faqat LOTIN indeks (default) — bola lotin savol beradi.");
  console.log("Kirill matn avtomatik lotinga o'girildi (Ulug'bek, To'rt ulus tarixi va h.k.).");
  console.log("Ixtiyoriy --dual-script: kirill nusxa ham yuklanadi (2x hajm, kamroq tavsiya).\n");
}

main().catch((err) => {
  console.error("\nFATAL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
