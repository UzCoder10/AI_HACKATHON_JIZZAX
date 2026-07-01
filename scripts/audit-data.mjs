/**
 * QADAM 1 — faqat o'qish (audit). Hech narsa o'chirmaydi.
 * Ishga tushirish: node scripts/audit-data.mjs
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  const text = readFileSync(".env", "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const PG_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const SAFARAI_TABLES = [
  "Parent",
  "Child",
  "ParentSettings",
  "Conversation",
  "Message",
  "MoodEntry",
  "SafetyEvent",
  "InsightReport",
  "InsightAlert",
  "GreatFigure",
  "PaymentTransaction",
];

async function auditPostgres() {
  process.env.DATABASE_URL = PG_URL;
  const prisma = new PrismaClient();

  const result = { connected: false, database: PG_URL.replace(/:[^:@]+@/, ":***@"), tables: {}, demo: {}, error: null };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.connected = true;

    for (const table of SAFARAI_TABLES) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM "${table}"`);
        result.tables[table] = rows[0]?.c ?? 0;
      } catch {
        result.tables[table] = null; // jadval yo'q
      }
    }

    // Demo/test izlar
    try {
      const demoChild = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS c FROM "Conversation" WHERE "childId" LIKE '%demo%' OR "childId" = 'child-demo-001'`
      );
      result.demo.conversationsWithDemoChildId = demoChild[0]?.c ?? 0;
    } catch {
      result.demo.conversationsWithDemoChildId = null;
    }

    try {
      const demoConv = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS c FROM "Child" WHERE "id" LIKE '%demo%'`
      );
      result.demo.childRowsWithDemo = demoConv[0]?.c ?? 0;
    } catch {
      result.demo.childRowsWithDemo = null;
    }

    // Langflow jadvallari (Nihol emas)
    const langflowTables = ["flow", "user", "message", "folder", "file"];
    result.langflowInfra = {};
    for (const t of langflowTables) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM "${t}"`);
        result.langflowInfra[t] = rows[0]?.c ?? 0;
      } catch {
        result.langflowInfra[t] = null;
      }
    }
  } catch (e) {
    result.error = e.message;
  } finally {
    await prisma.$disconnect();
  }

  return result;
}

async function auditRagflow() {
  const base = process.env.RAGFLOW_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.RAGFLOW_API_KEY;
  const datasetId = process.env.RAGFLOW_DATASET_ID;

  const result = { datasetId, documents: [], totalDocs: null, totalChunks: null, error: null };

  if (!base || !apiKey || !datasetId) {
    result.error = "RAGFlow env to'liq emas";
    return result;
  }

  try {
    // Dataset info
    const dsRes = await fetch(`${base}/api/v1/datasets?id=${datasetId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(20000),
    });
    const dsJson = await dsRes.json();
    if (dsJson.data?.[0]) {
      result.datasetName = dsJson.data[0].name;
      result.totalDocs = dsJson.data[0].document_count ?? dsJson.data[0].doc_num;
      result.totalChunks = dsJson.data[0].chunk_count ?? dsJson.data[0].chunk_num;
    }

    // Documents list
    const docRes = await fetch(
      `${base}/api/v1/datasets/${datasetId}/documents?page=1&page_size=100&orderby=create_time&desc=true`,
      { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(20000) }
    );
    const docJson = await docRes.json();
    const docs = docJson.data?.docs ?? docJson.data ?? [];
    result.documents = (Array.isArray(docs) ? docs : []).map((d) => ({
      id: d.id,
      name: d.name ?? d.location ?? d.file_name,
      chunkCount: d.chunk_num ?? d.chunk_count,
      status: d.run ?? d.status,
      size: d.size,
      createTime: d.create_time ?? d.create_date,
    }));
    if (result.totalDocs == null) result.totalDocs = result.documents.length;
  } catch (e) {
    result.error = e.message;
  }

  return result;
}

async function auditLangflow() {
  const base = process.env.LANGFLOW_API_URL?.replace(/\/+$/, "");
  const flowId = process.env.LANGFLOW_FLOW_ID;
  const apiKey = process.env.LANGFLOW_API_KEY;

  const result = { flowId, error: null };

  if (!base || !flowId) {
    result.error = "LangFlow env to'liq emas";
    return result;
  }

  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  try {
    const res = await fetch(`${base}/api/v1/flows/${flowId}`, {
      headers,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      result.error = `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`;
      return result;
    }
    const flow = await res.json();
    result.name = flow.name;
    result.description = flow.description?.slice?.(0, 120);
    result.updatedAt = flow.updated_at ?? flow.updatedAt;
    result.nodeCount = flow.data?.nodes?.length ?? flow.nodes?.length;
    result.isComponent = flow.is_component;
    result.endpointName = flow.endpoint_name;
    // Flow struktura — o'chirilmaydi
    result.nodeTypes = (flow.data?.nodes ?? flow.nodes ?? []).map((n) => n.data?.type ?? n.type).filter(Boolean);
  } catch (e) {
    result.error = e.message;
  }

  return result;
}

const [pg, rag, lf] = await Promise.all([auditPostgres(), auditRagflow(), auditLangflow()]);
console.log(JSON.stringify({ postgres: pg, ragflow: rag, langflow: lf }, null, 2));
