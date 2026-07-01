/**
 * getAllomaContext — jonli RAGFlow sinovi.
 *   npm run ragflow:test-context
 *   npm run ragflow:test-context -- beruniy "yulduzlar haqida"
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";

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

async function main() {
  loadEnv();

  const allomaId = process.argv[2] ?? "beruniy";
  const question = process.argv.slice(3).join(" ") || "yulduzlar haqida";

  const { get_alloma_context } = await import("../src/lib/rag/allomaContext");

  console.log(`\n=== get_alloma_context("${allomaId}", "${question}") ===\n`);

  const result = await get_alloma_context(allomaId, question);

  console.log("slug:      ", result.slug);
  console.log("figure:    ", result.figureName);
  console.log("found:     ", result.found);
  console.log("sources:   ", result.sources.join(", ") || "—");
  console.log("chunks:    ", result.chunks.length);
  if (result.error) console.log("error:     ", result.error);

  console.log("\n--- context ---\n");
  console.log(result.context || "(bo'sh — mos parcha topilmadi)");
  console.log("\n--- chunk scores ---");
  result.chunks.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.score.toFixed(3)} | ${c.source}`);
  });

  process.exit(result.found ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
