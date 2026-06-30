import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface ApiErrorBody {
  success: false;
  error: string;
  code?: string;
}

export function apiError(
  scope: string,
  status: number,
  error: string,
  options?: { code?: string; cause?: unknown }
): NextResponse<ApiErrorBody> {
  if (status >= 500) {
    logger.error(scope, error, {
      code: options?.code,
      cause: options?.cause instanceof Error ? options.cause.message : undefined,
    });
  } else {
    logger.warn(scope, error, { code: options?.code, status });
  }

  return NextResponse.json(
    { success: false, error, ...(options?.code ? { code: options.code } : {}) },
    { status }
  );
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<{ success: true; data: T }> {
  return NextResponse.json({ success: true, data }, { status });
}
