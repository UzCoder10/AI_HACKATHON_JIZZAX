import { createHash } from "crypto";
import { env } from "@/lib/env";

export function getAppUrl(): string {
  return env.appUrl.replace(/\/+$/, "");
}

/** Click webhook imzosi: md5(click_trans_id+service_id+SECRET+merchant_trans_id+amount+action+sign_time) */
export function verifyClickSignature(params: {
  clickTransId: string;
  serviceId: string;
  merchantTransId: string;
  amount: string;
  action: string;
  signTime: string;
  signString: string;
}): boolean {
  const secret = env.payments.click.secretKey;
  if (!secret) return false;

  const digest = createHash("md5")
    .update(
      params.clickTransId +
        params.serviceId +
        secret +
        params.merchantTransId +
        params.amount +
        params.action +
        params.signTime
    )
    .digest("hex");

  return digest === params.signString;
}

/** Payme Basic Auth tekshiruvi */
export function verifyPaymeAuth(authorizationHeader: string | null): boolean {
  if (!authorizationHeader?.startsWith("Basic ")) return false;

  const merchantId = env.payments.payme.merchantId;
  const secretKey = env.payments.payme.secretKey;
  if (!merchantId || !secretKey) return false;

  try {
    const decoded = Buffer.from(authorizationHeader.slice(6), "base64").toString("utf8");
    const [login, password] = decoded.split(":");
    return login === merchantId && password === secretKey;
  } catch {
    return false;
  }
}

export function verifyPaymeAuthTestMode(authorizationHeader: string | null): boolean {
  if (env.payments.payme.testMode) {
    // Test rejimida Paycom/Paycom credentials ham qabul qilinadi
    if (!authorizationHeader?.startsWith("Basic ")) return false;
    try {
      const decoded = Buffer.from(authorizationHeader.slice(6), "base64").toString("utf8");
      const [, password] = decoded.split(":");
      return password === env.payments.payme.secretKey;
    } catch {
      return false;
    }
  }
  return verifyPaymeAuth(authorizationHeader);
}
