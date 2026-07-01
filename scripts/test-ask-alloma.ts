/**
 * ask_alloma jonli sinov — bir necha savol-javob.
 * Ishga tushirish: npm run ragflow:test-alloma -- beruniy
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
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const allomaId = process.argv[2] ?? "beruniy";
const questions = process.argv.slice(3);

const DEFAULT_QUESTIONS = [
  "Yulduzlar haqida gapir",
  "Yer shakli qanday?",
  "Bu haqda aniq bilmasang ham ayt — Mars haqida nima bilasan?",
];

async function main() {
  const { ask_alloma } = await import("../src/lib/rag/askAlloma");

  const sessionId = `test-${Date.now()}`;
  const qs = questions.length > 0 ? questions : DEFAULT_QUESTIONS;

  console.log(`\n=== ask_alloma("${allomaId}") — ${qs.length} savol ===\n`);
  console.log(`session_id: ${sessionId}\n`);

  const history: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const question of qs) {
    console.log(`👤 Bola: ${question}`);

    const result = await ask_alloma({
      allomaId,
      question,
      sessionId,
      childId: "test-child",
      age: 11,
      name: "Test",
      language: "uz",
      conversationHistory: history,
    });

    console.log(`📚 Manbalar: ${result.sources.join(", ") || "—"}`);
    if (result.ragError) console.log(`⚠️  RAG: ${result.ragError}`);
    console.log(`🎭 ${result.figureName}: ${result.reply}`);
    console.log(`   [grounded=${result.grounded}, filtered=${result.filtered}]\n`);

    history.push({ role: "user", content: question });
    history.push({ role: "assistant", content: result.reply });
  }

  console.log(`Yakuniy session_id: ${sessionId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
