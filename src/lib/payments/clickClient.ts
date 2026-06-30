import { env } from "@/lib/env";
import { getAppUrl } from "./webhookVerify";

export function buildClickCheckoutUrl(params: {
  merchantTransId: string;
  amountUzs: number;
}): string {
  const { serviceId, merchantId } = env.payments.click;
  if (!serviceId || !merchantId) throw new Error("CLICK sozlamalari to'liq emas");

  const returnUrl = `${getAppUrl()}/subscription?status=success`;
  const search = new URLSearchParams({
    service_id: serviceId,
    merchant_id: merchantId,
    amount: String(params.amountUzs),
    transaction_param: params.merchantTransId,
    return_url: returnUrl,
  });

  return `https://my.click.uz/services/pay?${search.toString()}`;
}

export function isClickConfigured(): boolean {
  return Boolean(
    env.payments.click.serviceId &&
      env.payments.click.merchantId &&
      env.payments.click.secretKey
  );
}

export const CLICK_ERROR = {
  SUCCESS: 0,
  SIGN_ERROR: -1,
  AMOUNT_ERROR: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_EXISTS: -4,
  TRANSACTION_NOT_FOUND: -6,
  UPDATE_FAILED: -8,
} as const;
