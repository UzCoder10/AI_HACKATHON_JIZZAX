import { env } from "@/lib/env";

export function buildPaymeCheckoutUrl(params: {
  merchantTransId: string;
  amountTiyin: number;
  description?: string;
}): string {
  const merchantId = env.payments.payme.merchantId;
  if (!merchantId) throw new Error("PAYME_MERCHANT_ID sozlanmagan");

  const base = env.payments.payme.testMode
    ? "https://checkout.test.paycom.uz"
    : "https://checkout.paycom.uz";

  const payload = [
    `m=${merchantId}`,
    `ac.order_id=${params.merchantTransId}`,
    `a=${params.amountTiyin}`,
    params.description ? `c=${encodeURIComponent(params.description)}` : "",
  ]
    .filter(Boolean)
    .join(";");

  const encoded = Buffer.from(payload).toString("base64url");
  return `${base}/${encoded}`;
}

export function isPaymeConfigured(): boolean {
  return Boolean(env.payments.payme.merchantId && env.payments.payme.secretKey);
}
