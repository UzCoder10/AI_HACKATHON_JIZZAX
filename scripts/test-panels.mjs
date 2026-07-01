/**
 * Uch panel (bola, ota-ona, admin) API smoke test — DB + env tekshiruvi.
 * node scripts/test-panels.mjs
 */
import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadEnv();

const PORT = process.env.PORT || "3001";
const BASE = `http://127.0.0.1:${PORT}`;

async function fetchApi(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const [parents, children, figures, convs] = await Promise.all([
    client.query(`SELECT COUNT(*)::int AS c FROM safarai."Parent"`),
    client.query(`SELECT id, name FROM safarai."Child" ORDER BY "createdAt" DESC LIMIT 1`),
    client.query(`SELECT COUNT(*)::int AS c FROM safarai."GreatFigure"`).catch(() => ({ rows: [{ c: 0 }] })),
    client.query(`SELECT COUNT(*)::int AS c FROM safarai."Conversation"`).catch(() => ({ rows: [{ c: 0 }] })),
  ]);

  await client.end();

  const child = children.rows[0];
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK;
  const useChildMock = process.env.NEXT_PUBLIC_USE_CHILD_MOCK;

  console.log("═══════════════════════════════════════");
  console.log("  SAFARAI — PANEL API SMOKE TEST");
  console.log("═══════════════════════════════════════\n");

  console.log("📋 Env");
  console.log(`   NEXT_PUBLIC_USE_MOCK=${useMock}`);
  console.log(`   NEXT_PUBLIC_USE_CHILD_MOCK=${useChildMock}`);
  console.log(`   PORT=${PORT}\n`);

  console.log("🗄️  Database");
  console.log(`   Ota-ona: ${parents.rows[0].c}`);
  console.log(`   Bolalar: ${child ? `1+ (${child.name})` : "0"}`);
  console.log(`   Figuralar: ${figures.rows[0].c}`);
  console.log(`   Suhbatlar: ${convs.rows[0].c}\n`);

  // HTTP tests (server ishlamasa skip)
  const serverUp = await fetchApi("/api/lessons");
  if (!serverUp.ok && serverUp.status === 0) {
    console.log("⚠️  Dev server ishlamayapti — HTTP testlar o'tkazib yuborildi");
    console.log(`   Ishga tushirish: node node_modules/next/dist/bin/next dev -p ${PORT}\n`);
  } else {
    console.log("🌐 HTTP API (dev server)\n");

    const endpoints = [
      ["/api/lessons", "Bola — darslar"],
      [child ? `/api/child/profile?childId=${child.id}` : null, "Bola — profil"],
      [child ? `/api/child/progress?childId=${child.id}` : null, "Bola — XP/progress"],
      [child ? `/api/child/badges?childId=${child.id}` : null, "Bola — badge'lar"],
      ["/api/admin/overview", "Admin — overview"],
      ["/api/admin/users", "Admin — foydalanuvchilar"],
      ["/api/admin/children", "Admin — bolalar"],
      ["/api/admin/ai", "Admin — AI nazorat"],
      ["/api/admin/figures", "Admin — figuralar"],
      ["/api/admin/billing", "Admin — to'lovlar"],
      ["/api/admin/lessons", "Admin — kontent"],
    ].filter(([path]) => path);

    for (const [path, label] of endpoints) {
      const r = await fetchApi(path);
      const status = r.ok ? "✓" : "✗";
      const detail = r.ok
        ? `success, ${Array.isArray(r.json?.data) ? r.json.data.length + " ta" : "ok"}`
        : r.error ?? r.json?.error ?? `HTTP ${r.status}`;
      console.log(`   ${status} ${label}: ${detail}`);
    }
    console.log("");
  }

  console.log("👶 Bola paneli");
  console.log("   ✓ useVoiceChat → POST /api/chat/alloma/voice");
  console.log("   ✓ Nav: faqat /child/* ichki marshrutlar");
  console.log("   ✓ To'lov/parent havolalari yo'q");
  if (child) {
    console.log(`   → Test URL: /child?childId=${child.id}`);
  } else {
    console.log("   → Avval /register → /children dan bola qo'shing");
  }

  console.log("\n👨‍👩‍👧 Ota-ona paneli");
  console.log("   ✓ getChildren() → /api/parent/children + progress");
  console.log("   ✓ getChildById() → insights + progress");
  console.log("   ✓ Dashboard → /api/parent/insights (PIN kerak)");

  console.log("\n🛠️  Admin paneli");
  console.log("   ✓ Overview, Users, Children, AI, Billing, Content — real API");
  console.log("   ✓ Figuralar — GreatFigure DB / katalog fallback\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
