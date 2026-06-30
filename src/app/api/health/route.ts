import { NextResponse } from "next/server";
import { validateDataResidency } from "@/lib/dataLocality";

export async function GET() {
  const residency = validateDataResidency();

  return NextResponse.json({
    status: residency.ok ? "ok" : "degraded",
    version: process.env.npm_package_version ?? "0.1.0",
    environment: process.env.NODE_ENV ?? "development",
    dataResidency: {
      region: residency.region,
      database: residency.database,
      minio: residency.minio,
      compliant: residency.ok,
      warnings: residency.warnings,
      ...(process.env.NODE_ENV !== "production" ? { errors: residency.errors } : {}),
    },
  });
}
