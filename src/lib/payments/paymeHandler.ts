import {
  activateSubscription,
  cancelPaymentTransaction,
  getTransactionByMerchantId,
} from "./subscriptionService";
import { verifyPaymeAuthTestMode } from "./webhookVerify";

type PaymeErrorPayload = {
  code: number;
  message: { uz: string; ru: string; en: string };
};

/** Payme JSON-RPC xatolik kodlari */
const PAYME_ERRORS = {
  INVALID_AMOUNT: { code: -31001, message: { uz: "Noto'g'ri summa", ru: "Неверная сумма", en: "Invalid amount" } },
  INVALID_ACCOUNT: { code: -31050, message: { uz: "Buyurtma topilmadi", ru: "Заказ не найден", en: "Order not found" } },
  UNABLE_TO_PERFORM: { code: -31008, message: { uz: "Amal bajarib bo'lmadi", ru: "Невозможно выполнить", en: "Unable to perform" } },
  TRANSACTION_NOT_FOUND: { code: -31003, message: { uz: "Tranzaksiya topilmadi", ru: "Транзакция не найдена", en: "Transaction not found" } },
  AUTH_ERROR: { code: -32504, message: { uz: "Avtorizatsiya xatolik", ru: "Ошибка авторизации", en: "Auth error" } },
  METHOD_NOT_FOUND: { code: -32601, message: { uz: "Metod topilmadi", ru: "Метод не найден", en: "Method not found" } },
} as const satisfies Record<string, PaymeErrorPayload>;

interface PaymeRequest {
  id: number | string;
  method: string;
  params: Record<string, unknown>;
}

function paymeError(id: number | string, err: PaymeErrorPayload) {
  return { jsonrpc: "2.0", id, error: err };
}

function paymeResult(id: number | string, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

export async function handlePaymeWebhook(
  body: PaymeRequest,
  authHeader: string | null
): Promise<object> {
  if (!verifyPaymeAuthTestMode(authHeader)) {
    return paymeError(body.id, PAYME_ERRORS.AUTH_ERROR);
  }

  const { method, params, id } = body;
  const account = params.account as { order_id?: string } | undefined;
  const orderId = account?.order_id;
  if (!orderId && method !== "GetStatement") {
    return paymeError(id, PAYME_ERRORS.INVALID_ACCOUNT);
  }

  switch (method) {
    case "CheckPerformTransaction": {
      const tx = await getTransactionByMerchantId(String(orderId));
      if (!tx || tx.status === "CANCELLED") {
        return paymeError(id, PAYME_ERRORS.INVALID_ACCOUNT);
      }
      const amount = Number(params.amount);
      if (amount !== tx.amount) {
        return paymeError(id, PAYME_ERRORS.INVALID_AMOUNT);
      }
      return paymeResult(id, { allow: true });
    }

    case "CreateTransaction": {
      const tx = await getTransactionByMerchantId(String(orderId));
      if (!tx) return paymeError(id, PAYME_ERRORS.INVALID_ACCOUNT);
      if (Number(params.amount) !== tx.amount) return paymeError(id, PAYME_ERRORS.INVALID_AMOUNT);
      if (tx.status === "COMPLETED") {
        return paymeResult(id, {
          create_time: tx.paidAt?.getTime() ?? Date.now(),
          transaction: tx.providerTransId ?? tx.id,
          state: 2,
        });
      }
      return paymeResult(id, {
        create_time: Date.now(),
        transaction: tx.id,
        state: 1,
      });
    }

    case "PerformTransaction": {
      const tx = await getTransactionByMerchantId(String(orderId));
      if (!tx) return paymeError(id, PAYME_ERRORS.TRANSACTION_NOT_FOUND);
      const result = await activateSubscription({
        merchantTransId: tx.merchantTransId,
        providerTransId: String(params.id ?? tx.id),
      });
      if (!result.ok && result.reason === "NOT_FOUND") {
        return paymeError(id, PAYME_ERRORS.TRANSACTION_NOT_FOUND);
      }
      const updated = await getTransactionByMerchantId(tx.merchantTransId);
      return paymeResult(id, {
        transaction: updated?.providerTransId ?? updated?.id,
        perform_time: Date.now(),
        state: 2,
      });
    }

    case "CancelTransaction": {
      await cancelPaymentTransaction(String(orderId));
      return paymeResult(id, { transaction: String(orderId), cancel_time: Date.now(), state: -1 });
    }

    case "CheckTransaction": {
      const tx = await getTransactionByMerchantId(String(orderId));
      if (!tx) return paymeError(id, PAYME_ERRORS.TRANSACTION_NOT_FOUND);
      return paymeResult(id, {
        create_time: tx.createdAt.getTime(),
        perform_time: tx.paidAt?.getTime() ?? 0,
        cancel_time: tx.status === "CANCELLED" ? Date.now() : 0,
        transaction: tx.providerTransId ?? tx.id,
        state: tx.status === "COMPLETED" ? 2 : tx.status === "CANCELLED" ? -1 : 1,
        reason: null,
      });
    }

    default:
      return paymeError(id, PAYME_ERRORS.METHOD_NOT_FOUND);
  }
}

export function buildPaymeAccount(orderId: string) {
  return { order_id: orderId };
}
