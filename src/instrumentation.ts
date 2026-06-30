/**
 * Production ishga tushganda ma'lumotlar lokalizatsiyasini tekshiradi.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const { validateDataResidency } = await import("@/lib/dataLocality");
    const { logger } = await import("@/lib/logger");

    const report = validateDataResidency();
    if (!report.ok) {
      logger.error("startup", "Ma'lumotlar lokalizatsiyasi tekshiruvi muvaffaqiyatsiz", {
        errors: report.errors,
      });
    } else if (report.warnings.length > 0) {
      logger.warn("startup", "Ma'lumotlar lokalizatsiyasi ogohlantirishlari", {
        warnings: report.warnings,
      });
    } else {
      logger.info("startup", "Ma'lumotlar lokalizatsiyasi OK", { region: report.region });
    }
  }
}
