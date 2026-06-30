/**
 * Ma'lumotlar lokalizatsiyasi — DB va MinIO O'zbekiston hududida ekanini tekshirish.
 * Production da DATA_RESIDENCY_REGION=UZ majburiy.
 */

const FOREIGN_HOST_PATTERNS = [
  /\.amazonaws\.com/i,
  /\.rds\.amazonaws\.com/i,
  /\.googleapis\.com/i,
  /\.azure\.com/i,
  /\.cloud\.google/i,
  /supabase\.co/i,
  /neon\.tech/i,
  /\.vercel\.app/i,
  /\.herokuapp\.com/i,
  /\.digitalocean\.com/i,
];

const UZ_HINT_PATTERNS = [
  /\.uz\b/i,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /localhost/i,
];

export interface DataResidencyReport {
  ok: boolean;
  region: string;
  database: { configured: boolean; hostHint: string; uzCompliant: boolean | null };
  minio: { configured: boolean; hostHint: string; uzCompliant: boolean | null };
  errors: string[];
  warnings: string[];
}

function extractHost(connectionString: string): string {
  try {
    const url = new URL(connectionString.replace(/^postgresql:/, "http:"));
    return url.hostname;
  } catch {
    const match = connectionString.match(/@([^:/]+)/);
    return match?.[1] ?? connectionString;
  }
}

function isForeignHost(host: string): boolean {
  return FOREIGN_HOST_PATTERNS.some((p) => p.test(host));
}

function hasUzHint(host: string): boolean {
  return UZ_HINT_PATTERNS.some((p) => p.test(host));
}

function assessHost(host: string): { uzCompliant: boolean | null; warning?: string } {
  if (!host) return { uzCompliant: null };
  if (isForeignHost(host)) return { uzCompliant: false, warning: `Xorijiy bulut host: ${host}` };
  if (hasUzHint(host)) return { uzCompliant: true };
  return {
    uzCompliant: null,
    warning: `Host O'zbekiston ekanligi tasdiqlanmadi: ${host} — ichki IP yoki .uz domen bo'lishi kerak`,
  };
}

export function validateDataResidency(): DataResidencyReport {
  const region = process.env.DATA_RESIDENCY_REGION ?? "UZ";
  const dbUrl = process.env.DATABASE_URL ?? "";
  const minioHost = process.env.MINIO_ENDPOINT ?? "";

  const errors: string[] = [];
  const warnings: string[] = [];

  const dbHost = dbUrl ? extractHost(dbUrl) : "";
  const dbAssessment = assessHost(dbHost);
  const minioAssessment = assessHost(minioHost);

  if (process.env.NODE_ENV === "production") {
    if (region !== "UZ") {
      errors.push("DATA_RESIDENCY_REGION=UZ production uchun majburiy");
    }
    if (!dbUrl) {
      errors.push("DATABASE_URL production uchun majburiy");
    } else if (dbAssessment.uzCompliant === false) {
      errors.push("DATABASE_URL xorijiy bulutga ishora qiladi — ma'lumotlar O'zbekistonda saqlanmaydi");
    }
    if (minioHost && minioAssessment.uzCompliant === false) {
      errors.push("MINIO_ENDPOINT xorijiy bulutga ishora qiladi");
    }
  }

  if (dbAssessment.warning) warnings.push(dbAssessment.warning);
  if (minioAssessment.warning) warnings.push(minioAssessment.warning);

  if (dbUrl && dbAssessment.uzCompliant === null && process.env.NODE_ENV === "production") {
    warnings.push("DATABASE_URL hostini O'zbekiston DC ekanligini qo'lda tasdiqlang");
  }

  return {
    ok: errors.length === 0,
    region,
    database: {
      configured: !!dbUrl,
      hostHint: dbHost ? dbHost.replace(/^(.{3}).*(.{3})$/, "$1***$2") : "",
      uzCompliant: dbAssessment.uzCompliant,
    },
    minio: {
      configured: !!minioHost,
      hostHint: minioHost ? minioHost.replace(/^(.{3}).*(.{3})$/, "$1***$2") : "",
      uzCompliant: minioHost ? minioAssessment.uzCompliant : null,
    },
    errors,
    warnings,
  };
}
