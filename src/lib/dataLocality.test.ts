import { describe, it, expect, vi, afterEach } from "vitest";
import { validateDataResidency } from "./dataLocality";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("validateDataResidency", () => {
  it("production: xorijiy AWS host rad etiladi", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATA_RESIDENCY_REGION", "UZ");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@db.us-east-1.rds.amazonaws.com:5432/safarai");
    vi.stubEnv("MINIO_ENDPOINT", "s3.amazonaws.com");

    const report = validateDataResidency();

    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.includes("DATABASE_URL"))).toBe(true);
    expect(report.errors.some((e) => e.includes("MINIO"))).toBe(true);
  });

  it("production: .uz host qabul qilinadi", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATA_RESIDENCY_REGION", "UZ");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@db.safarai.internal.uz:5432/safarai");
    vi.stubEnv("MINIO_ENDPOINT", "minio.safarai.uz");

    const report = validateDataResidency();

    expect(report.ok).toBe(true);
    expect(report.database.uzCompliant).toBe(true);
    expect(report.minio.uzCompliant).toBe(true);
  });

  it("development: ogohlantirishlar xato emas", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@localhost:5432/safarai");

    const report = validateDataResidency();

    expect(report.ok).toBe(true);
  });
});
