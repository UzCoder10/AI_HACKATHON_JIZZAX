/**
 * Ovozli alloma oqimi + o'zbekcha STT/TTS sifat sinovi.
 * npm run voice:test-alloma
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
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

const UZ_TEST_PHRASES = [
  "Salom, yulduzlar haqida gapir.",
  "Yer shakli qanday o'lchangan?",
  "Men astronomiya haqida bilmoqchiman.",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordRecall(original: string, transcribed: string): number {
  const origWords = normalize(original).split(" ").filter(Boolean);
  const transSet = new Set(normalize(transcribed).split(" ").filter(Boolean));
  if (origWords.length === 0) return 0;
  const hits = origWords.filter((w) => transSet.has(w)).length;
  return hits / origWords.length;
}

async function main() {
  const { synthesizeSpeech, isOpenAiConfigured } = await import("../src/lib/llm");
  const { transcribeVoiceAudio } = await import("../src/lib/voice/transcribeService");
  const { runAllomaVoiceChat } = await import("../src/lib/voice/voiceService");

  if (!isOpenAiConfigured()) {
    console.error("OPENAI_API_KEY sozlanmagan");
    process.exit(1);
  }

  const outDir = join(process.cwd(), "tmp", "voice-test");
  mkdirSync(outDir, { recursive: true });

  console.log("\n=== O'zbekcha STT sifat sinovi (Whisper, avto-aniqlash) ===\n");

  const sttScores: number[] = [];

  for (let i = 0; i < UZ_TEST_PHRASES.length; i++) {
    const phrase = UZ_TEST_PHRASES[i];
    console.log(`📝 Asl: "${phrase}"`);

    const mp3 = await synthesizeSpeech(phrase, { voice: "nova", format: "mp3" });
    const mp3Path = join(outDir, `stt-test-${i + 1}.mp3`);
    writeFileSync(mp3Path, mp3);

    const stt = await transcribeVoiceAudio(mp3, {
      language: "uz",
      mimeType: "audio/mpeg",
      filename: `stt-test-${i + 1}.mp3`,
    });

    const recall = wordRecall(phrase, stt.text);
    sttScores.push(recall);

    console.log(`🎤 STT: "${stt.text}"`);
    console.log(`📊 So'z mosligi: ${(recall * 100).toFixed(0)}% (${stt.durationMs}ms)\n`);
  }

  const avgStt = sttScores.reduce((a, b) => a + b, 0) / sttScores.length;
  console.log(`STT o'rtacha so'z mosligi: ${(avgStt * 100).toFixed(0)}%\n`);

  console.log("=== To'liq ovozli alloma oqimi (beruniy) ===\n");

  const questionPhrase = "Yulduzlar haqida qisqacha gapir.";
  const questionMp3 = await synthesizeSpeech(questionPhrase, { voice: "nova", format: "mp3" });
  const questionPath = join(outDir, "alloma-question.mp3");
  writeFileSync(questionPath, questionMp3);

  const voiceResult = await runAllomaVoiceChat({
    allomaId: "beruniy",
    audio: questionMp3,
    audioMimeType: "audio/mpeg",
    audioFilename: "alloma-question.mp3",
    childId: "voice-test-child",
    age: 11,
    name: "Test",
    language: "uz",
  });

  console.log(`👤 STT savol: ${voiceResult.questionText}`);
  console.log(`🎭 ${voiceResult.figureName}: ${voiceResult.reply}`);
  console.log(`📚 Manbalar: ${voiceResult.sources.join(", ") || "—"}`);
  console.log(
    `⏱️  STT ${voiceResult.timings.sttMs}ms | LLM ${voiceResult.timings.llmMs}ms | TTS ${voiceResult.timings.ttsMs}ms | Jami ${voiceResult.timings.totalMs}ms`
  );
  console.log(`🔊 Ovoz: ${voiceResult.voice}`);

  if (voiceResult.audioBase64) {
    const replyPath = join(outDir, "alloma-reply.mp3");
    writeFileSync(replyPath, Buffer.from(voiceResult.audioBase64, "base64"));
    console.log(`\n💾 Javob audio: ${replyPath}`);
  }

  console.log("\n=== O'zbekcha sifat bahosi ===\n");

  let sttGrade: string;
  if (avgStt >= 0.85) sttGrade = "YAXSHI — bolalar ovozi uchun yetarli";
  else if (avgStt >= 0.65) sttGrade = "O'RTA — ba'zi so'zlar noto'g'ri; qisqa gapirish kerak";
  else sttGrade = "PAST — muqobil STT (Google/Azure uz-UZ) ko'rib chiqish kerak";

  console.log(`STT (Whisper avto-aniqlash): ${sttGrade}`);
  console.log(
    "TTS (OpenAI): O'zbek lotin matnini o'qiy oladi, lekin talaffuz rus/ingliz aksenti bilan; bolalar uchun qabul qilinadigan MVP darajasi."
  );
  console.log(
    "\n⚠️  Texnik xavf: OpenAI Whisper o'zbek til kodini (uz) qo'llab-quvvatlamaydi — avto-aniqlash ishlatiladi."
  );
  console.log("   Agar STT <65% bo'lsa, Google Cloud Speech-to-Text (uz-UZ) yoki Azure Speech ni sinab ko'ring.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
