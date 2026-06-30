import {
  activateSubscription,
  cancelPaymentTransaction,
  getTransactionByMerchantId,
} from "./subscriptionService";
import { verifyClickSignature } from "./webhookVerify";
import { CLICK_ERROR } from "./clickClient";

interface ClickWebhookBody {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  amount: string;
  action: number;
  sign_time: string;
  sign_string: string;
  error?: number;
  error_note?: string;
}

function clickResponse(
  error: number,
  errorNote: string,
  extra?: Record<string, unknown>
) {
  return { error, error_note: errorNote, ...extra };
}

export async function handleClickPrepare(body: ClickWebhookBody) {
  const valid = verifyClickSignature({
    clickTransId: body.click_trans_id,
    serviceId: body.service_id,
    merchantTransId: body.merchant_trans_id,
    amount: body.amount,
    action: String(body.action),
    signTime: body.sign_time,
    signString: body.sign_string,
  });

  if (!valid) {
    return clickResponse(CLICK_ERROR.SIGN_ERROR, "Imzo noto'g'ri");
  }

  const tx = await getTransactionByMerchantId(body.merchant_trans_id);
  if (!tx) {
    return clickResponse(CLICK_ERROR.TRANSACTION_NOT_FOUND, "Buyurtma topilmadi");
  }

  const amountTiyin = Math.round(parseFloat(body.amount) * 100);
  if (amountTiyin !== tx.amount) {
    return clickResponse(CLICK_ERROR.AMOUNT_ERROR, "Summa noto'g'ri");
  }

  if (tx.status === "COMPLETED") {
    return clickResponse(CLICK_ERROR.ALREADY_EXISTS, "Allaqachon to'langan");
  }

  return clickResponse(CLICK_ERROR.SUCCESS, "Success", {
    click_trans_id: body.click_trans_id,
    merchant_trans_id: body.merchant_trans_id,
    merchant_prepare_id: tx.id,
  });
}

export async function handleClickComplete(body: ClickWebhookBody) {
  const valid = verifyClickSignature({
    clickTransId: body.click_trans_id,
    serviceId: body.service_id,
    merchantTransId: body.merchant_trans_id,
    amount: body.amount,
    action: String(body.action),
    signTime: body.sign_time,
    signString: body.sign_string,
  });

  if (!valid) {
    return clickResponse(CLICK_ERROR.SIGN_ERROR, "Imzo noto'g'ri");
  }

  const tx = await getTransactionByMerchantId(body.merchant_trans_id);
  if (!tx) {
    return clickResponse(CLICK_ERROR.TRANSACTION_NOT_FOUND, "Buyurtma topilmadi");
  }

  if (body.error && body.error < 0) {
    await cancelPaymentTransaction(body.merchant_trans_id);
    return clickResponse(body.error, body.error_note ?? "Bekor qilindi");
  }

  await activateSubscription({
    merchantTransId: body.merchant_trans_id,
    providerTransId: body.click_trans_id,
  });

  return clickResponse(CLICK_ERROR.SUCCESS, "Success", {
    click_trans_id: body.click_trans_id,
    merchant_trans_id: body.merchant_trans_id,
    merchant_confirm_id: tx.id,
  });
}
