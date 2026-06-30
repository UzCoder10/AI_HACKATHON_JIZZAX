/** Yakuniy holat tekshiruvi */
const pg = require("pg");

async function main() {
  const client = new pg.Client({
    connectionString:
      "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip",
  });
  await client.connect();

  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'safarai' AND table_type = 'BASE TABLE' ORDER BY table_name`
  );
  const gf = await client.query('SELECT slug FROM safarai."GreatFigure" ORDER BY slug');
  const msg = await client.query('SELECT COUNT(*)::int AS c FROM public.message');
  const flow = await client.query('SELECT COUNT(*)::int AS c FROM public.flow');

  console.log(JSON.stringify({
    safaraiTables: tables.rows.map((r) => r.table_name),
    greatFigures: gf.rows.map((r) => r.slug),
    langflowMessage: msg.rows[0].c,
    langflowFlow: flow.rows[0].c,
  }, null, 2));

  await client.end();
}

main().catch(console.error);
