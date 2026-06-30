import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/ai/chatService";
import { getParentIdByChildId, checkChatLimit } from "@/lib/payments/limits";
import { apiError } from "@/lib/api/errors";
import type { ApiChatResponse } from "@/types/chat";
import type { AppLanguage } from "@/types/safety";

interface ChatBody {  childId?: string;
  conversationId?: string;
  message?: string;
  age?: number;
  name?: string;
  language?: AppLanguage;
}

function parseBody(body: ChatBody) {
  const childId = body.childId?.trim();
  const message = body.message?.trim();
  const age = body.age;
  const name = body.name?.trim() ?? "";
  const language = body.language;

  if (!childId) return { error: "childId talab qilinadi" };
  if (!message) return { error: "message bo'sh bo'lmasligi kerak" };
  if (message.length > 2000) return { error: "message juda uzun (max 2000)" };
  if (!age || age < 7 || age > 12) return { error: "age 7–12 oralig'ida bo'lishi kerak" };
  if (language !== "uz" && language !== "ru") return { error: "language 'uz' yoki 'ru' bo'lishi kerak" };

  return {
    data: {
      childId,
      conversationId: body.conversationId,
      message,
      age,
      name,
      language,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatBody;
    const parsed = parseBody(body);

    if ("error" in parsed) {
      return NextResponse.json<ApiChatResponse>(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const parentId = await getParentIdByChildId(parsed.data.childId);
    if (parentId) {
      const limit = await checkChatLimit(parentId, parsed.data.childId);
      if (!limit.allowed) {
        return NextResponse.json<ApiChatResponse>(
          { success: false, error: limit.reason },
          { status: 402 }
        );
      }
    }

    const result = await sendMessage(parsed.data);

    return NextResponse.json<ApiChatResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    return apiError(
      "POST /api/chat",
      500,
      "Suhbatda xatolik yuz berdi. Keyinroq urinib ko'ring.",
      { cause: error }
    ) as NextResponse<ApiChatResponse>;
  }
}