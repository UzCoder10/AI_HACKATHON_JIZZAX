/**
 * API ulanish diagnostikasi (debug session 9e74b4)
 * node --import tsx scripts/debug-api-connectivity.ts
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DEBUG_ENDPOINT =
  "http://127.0.0.1:7540/ingest/b8884068-3b45-4557-b9a6-1fb2efe1233e";
const SESSION = "9e74b4";

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

function dbg(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify({
      sessionId: SESSION,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
      runId: process.env.DEBUG_RUN_ID ?? "pre-fix",
    }),
  }).catch(() => {});
  // #endregion
}

async function probe(
  name: string,
  hypothesisId: string,
  fn: () => Promise<{ ok: boolean; detail: string; status?: number }>
) {
  try {
    const result = await fn();
    dbg(hypothesisId, "debug-api-connectivity.ts:probe", `${name}`, {
      ok: result.ok,
      detail: result.detail,
      status: result.status,
    });
    console.log(`${result.ok ? "✓" : "✗"} ${name}: ${result.detail}`);
    return result.ok;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    dbg(hypothesisId, "debug-api-connectivity.ts:probe", `${name} EXCEPTION`, {
      ok: false,
      detail,
    });
    console.log(`✗ ${name}: ${detail}`);
    return false;
  }
}

async function resolveDevServerBase(): Promise<{ base: string; port: string }> {
  const candidates = [
    process.env.PORT,
    "3001",
    "3000",
  ].filter((p, i, arr): p is string => Boolean(p) && arr.indexOf(p) === i);

  for (const port of candidates) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return { base: `http://127.0.0.1:${port}`, port };
    } catch {
      // try next port
    }
  }

  const fallback = process.env.PORT ?? "3001";
  return { base: `http://127.0.0.1:${fallback}`, port: fallback };
}

async function main() {
  loadEnv();
  const { base, port } = await resolveDevServerBase();

  console.log("\n=== API ULANISH DIAGNOSTIKASI ===\n");
  console.log(`Dev server: ${base} (PORT env=${process.env.PORT ?? "unset"})\n`);

  // H1: local Next.js server
  await probe("Local Next.js server", "H1", async () => {
    try {
      const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(5000) });
      const text = await res.text();
      return {
        ok: res.ok,
        status: res.status,
        detail: res.ok ? `HTTP ${res.status}` : `HTTP ${res.status} ${text.slice(0, 120)}`,
      };
    } catch (err) {
      return {
        ok: false,
        detail: `Server ishlamayapti (${port}) — ${err instanceof Error ? err.message : err}`,
      };
    }
  });

  // H1b: child progress API (bola paneli)
  await probe("GET /api/child/progress", "H1", async () => {
    try {
      const res = await fetch(`${base}/api/child/progress`, { signal: AbortSignal.timeout(8000) });
      const json = await res.json().catch(() => ({}));
      return {
        ok: res.ok || res.status === 400,
        status: res.status,
        detail: res.ok
          ? `HTTP ${res.status}, childId=${json?.data?.childId ?? "?"}`
          : res.status === 400
            ? `HTTP 400 (childId kerak — route mavjud)`
            : `HTTP ${res.status} ${JSON.stringify(json).slice(0, 100)}`,
      };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  });

  // H2: Database
  await probe("PostgreSQL (DATABASE_URL)", "H2", async () => {
    const pg = await import("pg");
    const client = new pg.default.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const r = await client.query(`SELECT COUNT(*)::int AS c FROM safarai."GreatFigure"`);
    await client.end();
    return { ok: true, detail: `ulanish OK, ${r.rows[0].c} figura` };
  });

  // H3: RAGFlow
  await probe("RAGFlow retrieval", "H3", async () => {
    const { query, getKnowledgeBase } = await import("../src/lib/rag/ragflowAdminClient");
    const id = process.env.RAGFLOW_DATASET_ID?.trim();
    if (!id) return { ok: false, detail: "RAGFLOW_DATASET_ID yo'q" };
    const kb = await getKnowledgeBase(id);
    try {
      await query(id, "Beruniy haqida", { topK: 1, similarityThreshold: 0.1 });
      return { ok: true, detail: `KB "${kb?.name}", query OK` };
    } catch (err) {
      return {
        ok: false,
        detail: `KB "${kb?.name}", chunks=${kb?.chunkCount ?? 0} — ${err instanceof Error ? err.message.slice(0, 120) : err}`,
      };
    }
  });

  // H4: STT providers
  const { getSttProvider, isSttConfigured, ALL_STT_PROVIDERS } = await import(
    "../src/lib/voice/stt"
  );
  const activeStt = getSttProvider();
  dbg("H4", "debug-api-connectivity.ts:stt", "STT provider config", {
    activeStt,
    configured: ALL_STT_PROVIDERS.map((p) => ({ p, ok: isSttConfigured(p) })),
    aiVoiceProvider: process.env.AI_VOICE_PROVIDER,
    aiSttProvider: process.env.AI_STT_PROVIDER,
  });
  console.log(
    `\nSTT: active=${activeStt}, configured=${ALL_STT_PROVIDERS.filter(isSttConfigured).join(", ") || "hech biri"}`
  );

  await probe("OpenAI Whisper", "H4", async () => {
    if (!isSttConfigured("openai")) return { ok: false, detail: "OPENAI_API_KEY yo'q" };
    const { transcribeWithProvider } = await import("../src/lib/voice/stt");
    const { readFileSync } = await import("fs");
    const sample = join(process.cwd(), "tmp/stt-compare/salom-yulduz.mp3");
    if (!existsSync(sample)) return { ok: false, detail: "sample audio yo'q (voice:compare-stt avval)" };
    const buf = readFileSync(sample);
    const r = await transcribeWithProvider("openai", buf, {
      mimeType: "audio/mpeg",
      filename: "test.mp3",
    });
    return { ok: r.text.length > 2, detail: `"${r.text.slice(0, 50)}" (${r.latencyMs}ms)` };
  });

  await probe("Muxlisa STT", "H4", async () => {
    if (!isSttConfigured("muxlisa")) return { ok: false, detail: "MUXLISA_API_KEY yo'q" };
    const { transcribeWithProvider } = await import("../src/lib/voice/stt");
    const sample = join(process.cwd(), "tmp/stt-compare/salom-yulduz.mp3");
    if (!existsSync(sample)) return { ok: false, detail: "sample audio yo'q" };
    const buf = readFileSync(sample);
    const r = await transcribeWithProvider("muxlisa", buf, {
      mimeType: "audio/mpeg",
      filename: "test.mp3",
    });
    return { ok: r.text.length > 2, detail: `"${r.text.slice(0, 50)}" (${r.latencyMs}ms)` };
  });

  // H5: Anthropic text
  await probe("Anthropic Claude", "H5", async () => {
    const key = process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) return { ok: false, detail: "ANTHROPIC_API_KEY yo'q" };
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
        max_tokens: 20,
        messages: [{ role: "user", content: "Salom" }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      detail: res.ok ? "javob OK" : `HTTP ${res.status} ${body.slice(0, 100)}`,
    };
  });

  console.log("\nDiagnostika tugadi. Log: debug-9e74b4.log\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
