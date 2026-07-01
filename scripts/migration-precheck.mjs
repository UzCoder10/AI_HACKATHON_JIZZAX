/** One-off pre-migration audit — read-only, no secrets printed */
import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const m = env.match(/^DATABASE_URL=(.+)$/m);
if (!m) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}
const url = m[1].trim();

const client = new pg.Client({ connectionString: url });
await client.connect();

const schemas = await client.query(`
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ORDER BY schema_name
`);

let messageCount = null;
let messageError = null;
try {
  const r = await client.query("SELECT COUNT(*)::bigint AS c FROM public.message");
  messageCount = String(r.rows[0].c);
} catch (e) {
  messageError = e.message;
}

let safaraiTableCount = 0;
let safaraiTables = [];
const saf = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'safarai' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);
safaraiTableCount = saf.rows.length;
safaraiTables = saf.rows.map((r) => r.table_name);

await client.end();

console.log(
  JSON.stringify(
    {
      databaseUrl_has_schema_safarai: url.includes("schema=safarai"),
      schemas: schemas.rows.map((r) => r.schema_name),
      public_and_safarai_present:
        schemas.rows.some((r) => r.schema_name === "public") &&
        schemas.rows.some((r) => r.schema_name === "safarai"),
      public_message_count_before: messageCount,
      public_message_query_error: messageError,
      safarai_table_count_before: safaraiTableCount,
      safarai_tables_before: safaraiTables,
    },
    null,
    2
  )
);
