/**
 * Muhit o'zgaruvchilari — barcha qiymatlar .env dan olinadi.
 * API kalitlarni kodga yozmang.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Muhit o'zgaruvchisi sozlanmagan: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: parseInt(optional("PORT", "3000"), 10),

  // AlemLLM
  alemlLm: {
    apiUrl: optional("ALEMLLM_API_URL"),
    apiKey: optional("ALEMLLM_API_KEY"),
    model: optional("ALEMLLM_MODEL", "gemma4"),
  },

  // RAGFlow
  ragflow: {
    apiUrl: optional("RAGFLOW_API_URL"),
    email: optional("RAGFLOW_EMAIL"),
    password: optional("RAGFLOW_PASSWORD"),
    apiKey: optional("RAGFLOW_API_KEY"),
    embeddingModel: optional("RAGFLOW_EMBEDDING_MODEL"),
    datasetId: optional("RAGFLOW_DATASET_ID"),
  },

  // LangFlow
  langflow: {
    apiUrl: optional("LANGFLOW_API_URL"),
    flowId: optional("LANGFLOW_FLOW_ID"),
    apiKey: optional("LANGFLOW_API_KEY"),
  },

  // PostgreSQL (Langflow infra — hozircha backend ishlatmaydi)
  pg: {
    host: optional("PG_HOST"),
    port: parseInt(optional("PG_PORT", "5432"), 10),
    database: optional("PG_DATABASE"),
    user: optional("PG_USER"),
    password: optional("PG_PASSWORD"),
  },

  // MinIO (Langflow infra — hozircha backend ishlatmaydi)
  minio: {
    endpoint: optional("MINIO_ENDPOINT"),
    port: parseInt(optional("MINIO_PORT", "9000"), 10),
    useSsl: optional("MINIO_USE_SSL", "false") === "true",
    accessKey: optional("MINIO_ACCESS_KEY"),
    secretKey: optional("MINIO_SECRET_KEY"),
    bucket: optional("MINIO_BUCKET"),
  },

  databaseUrl: optional("DATABASE_URL"),

  /** Ma'lumotlar lokalizatsiyasi — production da UZ majburiy */
  dataResidencyRegion: optional("DATA_RESIDENCY_REGION", "UZ"),

  appUrl: optional("APP_URL", "http://localhost:3000"),

  payments: {
    payme: {
      merchantId: optional("PAYME_MERCHANT_ID"),
      secretKey: optional("PAYME_SECRET_KEY"),
      testMode: optional("PAYME_TEST_MODE", "true") === "true",
    },
    click: {
      serviceId: optional("CLICK_SERVICE_ID"),
      merchantId: optional("CLICK_MERCHANT_ID"),
      merchantUserId: optional("CLICK_MERCHANT_USER_ID"),
      secretKey: optional("CLICK_SECRET_KEY"),
    },
  },
} as const;

export function requireAlemlLm() {
  return {
    apiUrl: required("ALEMLLM_API_URL"),
    apiKey: required("ALEMLLM_API_KEY"),
    model: env.alemlLm.model,
  };
}

export function requireRagflow() {
  return {
    apiUrl: required("RAGFLOW_API_URL"),
    apiKey: required("RAGFLOW_API_KEY"),
    email: env.ragflow.email,
    password: env.ragflow.password,
    embeddingModel: env.ragflow.embeddingModel,
    datasetId: required("RAGFLOW_DATASET_ID"),
  };
}

export function requireLangflow() {
  return {
    apiUrl: required("LANGFLOW_API_URL"),
    flowId: required("LANGFLOW_FLOW_ID"),
    apiKey: env.langflow.apiKey,
  };
}
