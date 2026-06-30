/** B1 — RAGFlow hujjatlarni o'chirish (dataset saqlanadi). */
import { readFileSync } from "fs";

function loadEnv() {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
  }
}
loadEnv();

const base = process.env.RAGFLOW_API_URL.replace(/\/+$/, "");
const apiKey = process.env.RAGFLOW_API_KEY;
const datasetId = process.env.RAGFLOW_DATASET_ID;

const DOC_IDS = [
  "b9a48a14711611f1a0317a1e47c46642",
  "b9725ad1711611f1831e7a1e47c46642",
  "b94836ea711611f18a957a1e47c46642",
  "b91259b7711611f1a63a7a1e47c46642",
  "b8e627c8711611f1afb07a1e47c46642",
];

async function listDocs() {
  const res = await fetch(
    `${base}/api/v1/datasets/${datasetId}/documents?page=1&page_size=100`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  const json = await res.json();
  const docs = json.data?.docs ?? json.data ?? [];
  return Array.isArray(docs) ? docs : [];
}

async function deleteOne(id) {
  const res = await fetch(`${base}/api/v1/datasets/${datasetId}/documents`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: [id] }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

console.log("=== B1: OLDIN ===");
const before = await listDocs();
console.log(`Hujjatlar: ${before.length}`);
before.forEach((d) => console.log(`  - ${d.name ?? d.id} (${d.id})`));

for (const id of DOC_IDS) {
  const name = before.find((d) => d.id === id)?.name ?? id;
  const result = await deleteOne(id);
  console.log(`DELETE ${name}: HTTP ${result.status}`, JSON.stringify(result.json));
}

console.log("\n=== B1: KEYIN ===");
const after = await listDocs();
console.log(`Hujjatlar: ${after.length}`);
after.forEach((d) => console.log(`  - ${d.name ?? d.id}`));
