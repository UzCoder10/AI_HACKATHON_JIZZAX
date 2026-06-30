/** safarai schema migration — faqat pg, LangFlow public ga tegmaydi */
import pg from "pg";
import { readFileSync } from "fs";

const URL =
  "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip";

async function count(client, schema, table) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM "${schema}"."${table}"`);
  return r.rows[0].c;
}

async function main() {
  const client = new pg.Client({ connectionString: URL });
  await client.connect();

  const msgBefore = await count(client, "public", "message");
  const flowBefore = await count(client, "public", "flow");
  console.log("OLDIN public.message:", msgBefore, "public.flow:", flowBefore);

  const schemaCheck = await client.query(
    `SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'safarai') AS e`
  );
  const tablesCheck = await client.query(
    `SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema = 'safarai' AND table_type = 'BASE TABLE'`
  );

  if ((tablesCheck.rows[0]?.c ?? 0) === 0) {
    const sql = readFileSync("prisma/migrations/20250630120000_init/migration.sql", "utf8");
    await client.query(sql);
    console.log("Migration SQL qo'llandi");
  } else {
    console.log("safarai jadvallar allaqachon mavjud — o'tkazib yuborildi");
  }

  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'safarai' ORDER BY table_name`
  );
  console.log("safarai jadvallar (" + tables.rows.length + "):", tables.rows.map((r) => r.table_name).join(", "));

  const msgAfter = await count(client, "public", "message");
  const flowAfter = await count(client, "public", "flow");
  console.log("KEYIN public.message:", msgAfter, "public.flow:", flowAfter);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
