/**
 * Uch STT provayderini yonma-yon solishtirish: Whisper, ElevenLabs Scribe, Muxlisa.
 *
 * npm run voice:compare-stt
 *
 * .env: OPENAI_API_KEY, ELEVENLABS_API_KEY, MUXLISA_API_KEY
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
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

interface TestSample {
  id: string;
  groundTruth: string;
  /** OpenAI TTS ovozi — bolaga yaqin */
  ttsVoice?: "nova" | "shimmer";
}

const CHILD_SAMPLES: TestSample[] = [
  { id: "beruniy-yulduz", groundTruth: "Beruniy yulduzlar haqida gapir", ttsVoice: "nova" },
  { id: "ibn-sino-shifokor", groundTruth: "Ibn Sino qanday shifokor edi", ttsVoice: "shimmer" },
  { id: "matematika", groundTruth: "menga matematika o'rgat", ttsVoice: "nova" },
  { id: "salom-yulduz", groundTruth: "Salom, yulduzlar haqida gapir", ttsVoice: "nova" },
  { id: "yer-shakli", groundTruth: "Yer shakli qanday o'lchangan", ttsVoice: "shimmer" },
  { id: "astronomiya", groundTruth: "Men astronomiya haqida bilmoqchiman", ttsVoice: "nova" },
];

interface ProviderRun {
  text: string;
  recall: number;
  wer: number;
  latencyMs: number;
  error?: string;
}

async function ensureAudioSamples(
  outDir: string,
  samples: TestSample[]
): Promise<Map<string, { path: string; buffer: Buffer; durationSec: number }>> {
  const { synthesizeSpeech, isOpenAiConfigured } = await import("../src/lib/llm");
  if (!isOpenAiConfigured()) {
    throw new Error("OPENAI_API_KEY kerak — test audiosini TTS bilan yaratish uchun");
  }

  mkdirSync(outDir, { recursive: true });
  const map = new Map<string, { path: string; buffer: Buffer; durationSec: number }>();

  for (const sample of samples) {
    const filePath = join(outDir, `${sample.id}.mp3`);
    let buffer: Buffer;

    if (existsSync(filePath)) {
      buffer = readFileSync(filePath);
    } else {
      console.log(`  🔊 Audio yaratilmoqda: "${sample.groundTruth}"`);
      buffer = await synthesizeSpeech(sample.groundTruth, {
        voice: sample.ttsVoice ?? "nova",
        format: "mp3",
      });
      writeFileSync(filePath, buffer);
    }

    // MP3 davomiyligi taxmin: ~16kbps bolalar gapisi uchun ~100 byte/sec
    const durationSec = Math.max(1.5, buffer.length / 4000);
    map.set(sample.id, { path: filePath, buffer, durationSec });
  }

  return map;
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len - 1) + "…" : str.padEnd(len);
}

async function main() {
  const {
    ALL_STT_PROVIDERS,
    STT_PRICING,
    approximateWordErrorRate,
    estimateSttCostUsd,
    isElevenLabsConfigured,
    isMuxlisaConfigured,
    isSttConfigured,
    transcribeWithProvider,
    wordRecall,
  } = await import("../src/lib/voice/stt");

  const outDir = join(process.cwd(), "tmp", "stt-compare");
  console.log("\n=== STT SOLISHTIRUV: Whisper | ElevenLabs Scribe | Muxlisa ===\n");

  const providers = ALL_STT_PROVIDERS.filter((p) => {
    if (p === "openai") return isSttConfigured("openai");
    if (p === "elevenlabs") return isElevenLabsConfigured();
    if (p === "muxlisa") return isMuxlisaConfigured();
    return false;
  });

  if (providers.length === 0) {
    console.error("Hech qanday STT provayder sozlanmagan. .env ga kalitlarni qo'shing.");
    process.exit(1);
  }

  console.log(`Faol provayderlar: ${providers.join(", ")}\n`);
  console.log("Test audiosini tayyorlash...\n");
  const audioMap = await ensureAudioSamples(outDir, CHILD_SAMPLES);

  type Aggregate = {
    recalls: number[];
    wers: number[];
    latencies: number[];
    errors: number;
    totalAudioSec: number;
  };

  const aggregates: Record<string, Aggregate> = {};
  for (const p of providers) {
    aggregates[p] = { recalls: [], wers: [], latencies: [], errors: 0, totalAudioSec: 0 };
  }

  const rows: string[] = [];

  for (const sample of CHILD_SAMPLES) {
    const audio = audioMap.get(sample.id);
    if (!audio) continue;

    console.log(`\n📝 Ground truth: "${sample.groundTruth}"`);
    console.log("─".repeat(72));

    const runs: Record<string, ProviderRun> = {};

    for (const provider of providers) {
      aggregates[provider].totalAudioSec += audio.durationSec;
      process.stdout.write(`  ${pad(provider, 12)} ... `);

      try {
        const result = await transcribeWithProvider(provider, audio.buffer, {
          mimeType: "audio/mpeg",
          filename: `${sample.id}.mp3`,
          language: provider === "elevenlabs" ? "uzb" : undefined,
        });
        const recall = wordRecall(sample.groundTruth, result.text);
        const wer = approximateWordErrorRate(sample.groundTruth, result.text);
        runs[provider] = { text: result.text, recall, wer, latencyMs: result.latencyMs };
        aggregates[provider].recalls.push(recall);
        aggregates[provider].wers.push(wer);
        aggregates[provider].latencies.push(result.latencyMs);
        console.log(`✓ ${(recall * 100).toFixed(0)}% | ${result.latencyMs}ms`);
        console.log(`     → "${result.text}"`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        runs[provider] = { text: "", recall: 0, wer: 1, latencyMs: 0, error: msg };
        aggregates[provider].errors += 1;
        console.log(`✗ ${msg.slice(0, 80)}`);
      }
    }

    rows.push(
      `| ${sample.groundTruth} | ${providers.map((p) => (runs[p]?.error ? "ERR" : `${(runs[p].recall * 100).toFixed(0)}%`)).join(" | ")} |`
    );
  }

  console.log("\n\n=== YAKUNIY JADVAL ===\n");
  console.log(
    "| Provayder | So'z aniqligi | WER (taxmin) | O'rtacha latency | Narx (1 daq) | Holat |"
  );
  console.log("|-----------|---------------|--------------|------------------|--------------|-------|");

  const summary: Array<{ provider: string; score: number; latency: number }> = [];

  for (const provider of providers) {
    const agg = aggregates[provider];
    const n = agg.recalls.length || 1;
    const avgRecall = agg.recalls.reduce((a, b) => a + b, 0) / n;
    const avgWer = agg.wers.reduce((a, b) => a + b, 0) / n;
    const avgLatency = agg.latencies.reduce((a, b) => a + b, 0) / (agg.latencies.length || 1);
    const cost = estimateSttCostUsd(provider, 60);
    const pricing = STT_PRICING[provider as keyof typeof STT_PRICING];
    const costStr =
      pricing.uzsPerMinute != null
        ? `~${pricing.uzsPerMinute} token/daq`
        : cost != null
          ? `~$${cost.toFixed(4)}/daq`
          : "—";

    const status =
      agg.errors > 0
        ? `${agg.errors} xato`
        : avgRecall >= 0.8
          ? "Yaxshi"
          : avgRecall >= 0.6
            ? "O'rta"
            : "Past";

    console.log(
      `| ${provider} | ${(avgRecall * 100).toFixed(1)}% | ${(avgWer * 100).toFixed(1)}% | ${Math.round(avgLatency)} ms | ${costStr} | ${status} |`
    );

    if (agg.errors === 0) {
      summary.push({ provider, score: avgRecall, latency: avgLatency });
    }
  }

  console.log("\n=== TAVSIYA ===\n");

  summary.sort((a, b) => b.score - a.score || a.latency - b.latency);
  if (summary.length === 0) {
    console.log("Hech qanday provayder muvaffaqiyatli ishlamadi.");
    console.log("- ElevenLabs: API kalitda speech_to_text ruxsati kerak (dashboard → API keys).");
    console.log("- Muxlisa: https://service.muxlisa.uz/api/v2/stt, header x-api-key, field audio");
    console.log("- Whisper: OPENAI_API_KEY, o'zbek uchun language kodi yo'q (avto-aniqlash)");
  } else {
    const best = summary[0];
    console.log(
      `O'zbekcha bolalar ovozi uchun eng yaxshi: **${best.provider}** (${(best.score * 100).toFixed(1)}% so'z aniqligi, ~${Math.round(best.latency)}ms).`
    );

    if (best.provider === "muxlisa") {
      console.log(
        "\nMuxlisa mahalliy o'zbek STT — lotin matn, aralash til kamroq. AI_VOICE_PROVIDER=muxlisa qiling."
      );
    } else if (best.provider === "openai") {
      console.log(
        "\nWhisper hali ham yaxshi, lekin turk/arab aralashmasi bo'lishi mumkin. Muxlisa sinab ko'ring."
      );
    }

    console.log("\n.env sozlash:");
    console.log(`  AI_VOICE_PROVIDER=${best.provider}`);
    console.log(`  # yoki faqat STT: AI_STT_PROVIDER=${best.provider}`);
  }

  console.log("\n=== MUXLISA API (hujjat) ===");
  console.log("POST https://service.muxlisa.uz/api/v2/stt");
  console.log("Header: x-api-key: <MUXLISA_API_KEY>");
  console.log("Body: multipart/form-data, field: audio (wav tavsiya etiladi)");
  console.log("Javob: { \"text\": \"...\" }");
  console.log("Kabinet: muxlisa.uz → API kalitlar (obuna balansi kerak)\n");
}

main().catch((err) => {
  console.error("\nFATAL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
