/** Schema audit — faqat o'qish */
import { PrismaClient } from "@prisma/client";

async function main() {
  process.env.DATABASE_URL =
    "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip";

  const prisma = new PrismaClient();

  const schemas = await prisma.$queryRaw<{ schema_name: string }[]>`
    SELECT schema_name FROM information_schema.schemata ORDER BY schema_name
  `;

  const safaraiExists = schemas.some((r) => r.schema_name === "safarai");

  const langflowTables = ["message", "user", "flow", "folder", "file"];
  const tableSchemas: Record<string, string[]> = {};
  const counts: Record<string, number | string> = {};

  for (const t of langflowTables) {
    const rows = await prisma.$queryRaw<{ table_schema: string }[]>`
      SELECT table_schema FROM information_schema.tables WHERE table_name = ${t}
    `;
    tableSchemas[t] = rows.map((x) => x.table_schema);

    for (const sch of tableSchemas[t]) {
      try {
        const c = await prisma.$queryRawUnsafe<{ c: number }[]>(
          `SELECT COUNT(*)::int AS c FROM "${sch}"."${t}"`
        );
        counts[`${sch}.${t}`] = c[0]?.c ?? 0;
      } catch (e) {
        counts[`${sch}.${t}`] = e instanceof Error ? e.message : "error";
      }
    }
  }

  const safaraiTables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'safarai' ORDER BY table_name
  `;

  console.log(
    JSON.stringify(
      {
        schemas: schemas.map((r) => r.schema_name),
        safaraiExists,
        tableSchemas,
        counts,
        safaraiTableCount: safaraiTables.length,
        safaraiTables: safaraiTables.map((r) => r.table_name),
      },
      null,
      2
    )
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
