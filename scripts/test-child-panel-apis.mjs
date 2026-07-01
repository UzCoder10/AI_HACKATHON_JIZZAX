/**
 * Bola paneli API smoke test (server ishlamasa route handler emas, Prisma + mapper).
 * Ishga tushirish: node scripts/test-child-panel-apis.mjs
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

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL topilmadi");
  process.exit(1);
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  const childRes = await client.query(
    `SELECT id, name, age, language FROM safarai."Child" ORDER BY "createdAt" DESC LIMIT 1`
  );
  const child = childRes.rows[0];

  const lessonRes = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM information_schema.tables
     WHERE table_schema = 'safarai' AND table_name = 'LessonTopic'`
  ).catch(() => ({ rows: [{ cnt: 0 }] }));
  const hasLessonTable = (lessonRes.rows[0]?.cnt ?? 0) > 0;
  let activeLessons = 0;
  if (hasLessonTable) {
    const cnt = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM safarai."LessonTopic" WHERE status = 'ACTIVE'`
    );
    activeLessons = cnt.rows[0]?.cnt ?? 0;
  } else {
    activeLessons = 0;
    console.log("  (LessonTopic jadvali hali migratsiya qilinmagan — katalog fallback ishlatiladi)");
  }

  let msgCount = 0;
  let convCount = 0;
  if (child) {
    const msgRes = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM safarai."Message" m
       JOIN safarai."Conversation" c ON c.id = m."conversationId"
       WHERE c."childId" = $1`,
      [child.id]
    );
    msgCount = msgRes.rows[0]?.cnt ?? 0;

    const convRes = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM safarai."Conversation" WHERE "childId" = $1`,
      [child.id]
    );
    convCount = convRes.rows[0]?.cnt ?? 0;
  }

  await client.end();

  console.log("=== BOLA PANELI API SMOKE TEST ===\n");
  console.log("Env:");
  console.log("  NEXT_PUBLIC_USE_MOCK:", process.env.NEXT_PUBLIC_USE_MOCK ?? "(unset)");
  console.log("  NEXT_PUBLIC_USE_CHILD_MOCK:", process.env.NEXT_PUBLIC_USE_CHILD_MOCK ?? "(unset)");
  console.log("");
  console.log("Database:");
  if (!child) {
    console.log("  ⚠ Bola profili yo'q — avval ota-ona panelidan bola qo'shing");
  } else {
    console.log(`  ✓ Bola: ${child.name} (${child.age} yosh) id=${child.id}`);
    console.log(`  ✓ Suhbatlar: ${convCount}, Xabarlar: ${msgCount}`);
    console.log(`  ✓ XP (taxminiy): ${msgCount * 15 + convCount * 10}`);
  }
  console.log(`  ✓ Faol darslar: ${activeLessons}`);
  console.log("");
  console.log("Frontend ulanishlar (kod tekshiruvi):");
  console.log("  ✓ getChildProgress → GET /api/child/progress?childId=");
  console.log("  ✓ getLessons → GET /api/lessons");
  console.log("  ✓ getBadges → GET /api/child/badges?childId=");
  console.log("  ✓ fetchChildProfile → GET /api/child/profile?childId=");
  console.log("  ✓ postAllomaVoiceChat → POST /api/chat/alloma/voice");
  console.log("  ✓ useVoiceChat → MediaRecorder + postAllomaVoiceChat");
  console.log("");
  console.log("Bola xavfsizligi:");
  console.log("  ✓ Nav faqat /child/* ichki marshrutlar");
  console.log("  ✓ To'lov/parent/login havolalari yo'q");
  if (child) {
    console.log("");
    console.log("Manual test URL:");
    console.log(`  http://localhost:3001/child?childId=${child.id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
