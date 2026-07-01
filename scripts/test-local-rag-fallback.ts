import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
  }
}
loadEnv();

const tests = [
  { id: "beruniy", q: "Yer haqida nima kashf qilgan?" },
  { id: "ibn_sino", q: "Bemorni qanday davolagan?" },
  { id: "ulugbek", q: "Rasadxona haqida gapir" },
  { id: "navoiy", q: "Xamsa haqida ayt" },
];

async function main() {
  const { getAllomaContext } = await import("../src/lib/rag/allomaContext");
  console.log("\n=== LOKAL RAG FALLBACK SINOVI ===\n");
  for (const t of tests) {
    const r = await getAllomaContext(t.id, t.q);
    console.log(`${t.id}: found=${r.found} chunks=${r.chunks.length} sources=${r.sources.join(", ")}`);
    if (r.error) console.log(`  ragError: ${r.error.slice(0, 80)}`);
    if (r.context) console.log(`  preview: ${r.context.slice(0, 120).replace(/\n/g, " ")}...`);
  }
}

main().catch(console.error);
