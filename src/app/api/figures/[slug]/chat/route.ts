import { NextRequest, NextResponse } from "next/server";
import { sendFigureMessage } from "@/lib/rag/figureService";
import {
  getParentIdByChildId,
  getParentSubscription,
  checkChatLimit,
  checkFigureAccess,
} from "@/lib/payments/limits";
import type { ApiFigureChatResponse } from "@/types/figures";
import type { AppLanguage } from "@/types/safety";

interface FigureChatBody {
  childId?: string;
  conversationId?: string;
  message?: string;
  age?: number;
  name?: string;
  language?: AppLanguage;
}

function parseBody(body: FigureChatBody) {
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as FigureChatBody;
    const parsed = parseBody(body);

    if ("error" in parsed) {
      return NextResponse.json<ApiFigureChatResponse>(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const parentId = await getParentIdByChildId(parsed.data.childId);
    if (parentId) {
      const sub = await getParentSubscription(parentId);
      const figureLimit = checkFigureAccess(sub.planId, slug);
      if (!figureLimit.allowed) {
        return NextResponse.json<ApiFigureChatResponse>(
          { success: false, error: figureLimit.reason },
          { status: 402 }
        );
      }
      const chatLimit = await checkChatLimit(parentId, parsed.data.childId);
      if (!chatLimit.allowed) {
        return NextResponse.json<ApiFigureChatResponse>(
          { success: false, error: chatLimit.reason },
          { status: 402 }
        );
      }
    }

    const result = await sendFigureMessage({
      slug,
      ...parsed.data,
    });

    return NextResponse.json<ApiFigureChatResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[POST /api/figures/[slug]/chat]", error);
    const message =
      error instanceof Error && error.message.includes("topilmadi")
        ? error.message
        : "Suhbatda xatolik yuz berdi. Keyinroq urinib ko'ring.";

    const status = error instanceof Error && error.message.includes("topilmadi") ? 404 : 500;

    return NextResponse.json<ApiFigureChatResponse>(
      { success: false, error: message },
      { status }
    );
  }
}
