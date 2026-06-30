/** _prisma_migrations jadvalini safarai schema'da belgilash */
const pg = require("pg");

async function main() {
  const client = new pg.Client({
    connectionString:
      "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip",
  });
  await client.connect();

  await client.query(`CREATE SCHEMA IF NOT EXISTS safarai`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS safarai."_prisma_migrations" (
      id VARCHAR(36) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      finished_at TIMESTAMPTZ,
      migration_name VARCHAR(255) NOT NULL,
      logs TEXT,
      rolled_back_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  const exists = await client.query(
    `SELECT 1 FROM safarai."_prisma_migrations" WHERE migration_name = $1`,
    ["20250630120000_init"]
  );

  if (exists.rowCount === 0) {
    await client.query(
      `INSERT INTO safarai."_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES ($1, $2, NOW(), $3, 1)`,
      ["20250630120000_init", "manual-safarai-init", "20250630120000_init"]
    );
    console.log("Migration history yozildi");
  } else {
    console.log("Migration history allaqachon bor");
  }

  await client.end();
}

main().catch(console.error);
