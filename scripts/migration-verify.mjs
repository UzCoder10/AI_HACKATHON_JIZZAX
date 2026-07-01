/** Read-only post-migration verification — no secrets */
import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim();
const client = new pg.Client({ connectionString: url });
await client.connect();

const gfCount = await client.query('SELECT COUNT(*)::int AS c FROM safarai."GreatFigure"');
const gfSlugs = await client.query('SELECT slug FROM safarai."GreatFigure" ORDER BY slug');

const tables = ["Parent", "Child", "Conversation", "Message"];
const counts = {};
for (const t of tables) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM safarai."${t}"`);
  counts[t] = r.rows[0].c;
}

const msgPublic = await client.query("SELECT COUNT(*)::bigint AS c FROM public.message");

const convChildIds = await client.query(`
  SELECT "childId", COUNT(*)::int AS cnt
  FROM safarai."Conversation"
  GROUP BY "childId"
  ORDER BY "childId"
`);

await client.end();

console.log(
  JSON.stringify(
    {
      greatFigure_count: gfCount.rows[0].c,
      greatFigure_slugs: gfSlugs.rows.map((r) => r.slug),
      safarai_table_counts: counts,
      conversation_by_childId: convChildIds.rows,
      public_message_count: String(msgPublic.rows[0].c),
    },
    null,
    2
  )
);
