/** safarai schema migration qo'llash — LangFlow public ga tegmaydi */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

async function main() {
  process.env.DATABASE_URL =
    "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip?schema=safarai";

  const sql = readFileSync("prisma/migrations/20250630120000_init/migration.sql", "utf8");
  const prisma = new PrismaClient();

  // LangFlow count OLDIN
  const before = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int AS c FROM "public"."message"`
  );
  const flowBefore = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int AS c FROM "public"."flow"`
  );
  console.log("OLDIN public.message:", before[0]?.c, "public.flow:", flowBefore[0]?.c);

  const safaraiExists = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'safarai') AS exists
  `;

  if (!safaraiExists[0]?.exists) {
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "safarai"`);
    console.log("safarai schema yaratildi");
  } else {
    const tables = await prisma.$queryRaw<{ c: number }[]>`
      SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema = 'safarai'
    `;
    if ((tables[0]?.c ?? 0) > 0) {
      console.log("safarai schema allaqachon jadvallarga ega — migrate o'tkazib yuborildi");
    }
  }

  const tableCount = await prisma.$queryRaw<{ c: number }[]>`
    SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema = 'safarai' AND table_type = 'BASE TABLE'
  `;

  if ((tableCount[0]?.c ?? 0) === 0) {
    // Bo'laklab bajarish — bir martalik to'liq SQL
    await prisma.$executeRawUnsafe(sql);
    console.log("Migration SQL qo'llandi");
  }

  const afterTables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'safarai' ORDER BY table_name
  `;
  console.log("safarai jadvallar:", afterTables.length, afterTables.map((t) => t.table_name));

  const after = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int AS c FROM "public"."message"`
  );
  const flowAfter = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int AS c FROM "public"."flow"`
  );
  console.log("KEYIN public.message:", after[0]?.c, "public.flow:", flowAfter[0]?.c);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
