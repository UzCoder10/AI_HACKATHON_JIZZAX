/** Schema audit — faqat o'qish */
import pg from "pg";

const client = new pg.Client({
  connectionString:
    "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip",
});

await client.connect();

const schemas = await client.query(
  `SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`
);

const safaraiExists = schemas.rows.some((r) => r.schema_name === "safarai");

const langflowTables = ["message", "user", "flow", "folder", "file"];
const tableSchemas = {};
for (const t of langflowTables) {
  const r = await client.query(
    `SELECT table_schema, COUNT(*)::int AS cnt FROM information_schema.tables t
     JOIN (SELECT 1) x ON true
     WHERE table_name = $1 AND table_schema NOT IN ('pg_catalog','information_schema')
     GROUP BY table_schema`,
    [t]
  ).catch(() => ({ rows: [] }));

  // Better query - find which schema has the table
  const r2 = await client.query(
    `SELECT table_schema FROM information_schema.tables WHERE table_name = $1`,
    [t]
  );
  tableSchemas[t] = r2.rows.map((x) => x.table_schema);
}

const counts = {};
for (const t of langflowTables) {
  for (const sch of tableSchemas[t] ?? []) {
    try {
      const c = await client.query(`SELECT COUNT(*)::int AS c FROM "${sch}"."${t}"`);
      counts[`${sch}.${t}`] = c.rows[0].c;
    } catch (e) {
      counts[`${sch}.${t}`] = `error: ${e.message}`;
    }
  }
}

const safaraiTables = await client.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'safarai' ORDER BY table_name`
);

console.log(JSON.stringify({ schemas: schemas.rows.map((r) => r.schema_name), safaraiExists, tableSchemas, counts, safaraiTables: safaraiTables.rows }, null, 2));
await client.end();
