import pg from "pg";
import fs from "fs";
const url = fs.readFileSync(".env", "utf8").match(/^DATABASE_URL=(.+)$/m)[1].trim();
const client = new pg.Client({ connectionString: url });
await client.connect();
const r = await client.query(
  'SELECT "childId", COUNT(*)::int AS cnt FROM safarai."Conversation" GROUP BY "childId" ORDER BY "childId"'
);
console.log(JSON.stringify(r.rows, null, 2));
await client.end();
