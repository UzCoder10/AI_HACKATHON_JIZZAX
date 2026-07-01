import { NextRequest, NextResponse } from "next/server";
import { askAlloma } from "@/lib/rag/askAlloma";
import { isKnownAllomaId } from "@/lib/rag/allomaIds";
import { assertAllomaChatAccess } from "@/lib/rag/allomaAccess";
import type { ApiAllomaChatBody, ApiAllomaChatResponse } from "@/types/alloma";
import type { AppLanguage } from "@/types/safety";

function parseBody(body: ApiAllomaChatBody) {
  const allomaId = body.alloma_id?.trim();
  const question = body.question?.trim();
  const childId = (body.child_id ?? body.childId)?.trim();
  const sessionId = body.session_id?.trim();
  const age = body.age;
  const name = body.name?.trim() ?? "";
  const language = body.language;

  if (!allomaId) return { error: "alloma_id talab qilinadi" };
  if (!isKnownAllomaId(allomaId)) return { error: `Noma'lum alloma: ${allomaId}` };
  if (!question) return { error: "question bo'sh bo'lmasligi kerak" };
  if (question.length > 2000) return { error: "question juda uzun (max 2000)" };
  if (!childId) return { error: "child_id talab qilinadi" };
  if (!age || age < 7 || age > 12) return { error: "age 7–12 oralig'ida bo'lishi kerak" };
  if (language !== "uz" && language !== "ru") return { error: "language 'uz' yoki 'ru' bo'lishi kerak" };

  return {
    data: { allomaId, question, childId, sessionId, age, name, language: language as AppLanguage },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ApiAllomaChatBody;
    const parsed = parseBody(body);

    if ("error" in parsed) {
      return NextResponse.json<ApiAllomaChatResponse>(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const access = await assertAllomaChatAccess(parsed.data.childId, parsed.data.allomaId);
    if (!access.allowed) {
      return NextResponse.json<ApiAllomaChatResponse>(
        { success: false, error: access.reason },
        { status: access.status }
      );
    }

    const result = await askAlloma({
      allomaId: parsed.data.allomaId,
      question: parsed.data.question,
      sessionId: parsed.data.sessionId,
      childId: parsed.data.childId,
      age: parsed.data.age,
      name: parsed.data.name,
      language: parsed.data.language,
    });

    return NextResponse.json<ApiAllomaChatResponse>({ success: true, data: result });
  } catch (error) {
    console.error("[POST /api/chat/alloma]", error);
    const message =
      error instanceof Error && (error.message.includes("Noma'lum") || error.message.includes("topilmadi"))
        ? error.message
        : "Suhbatda xatolik yuz berdi. Keyinroq urinib ko'ring.";
    const status =
      error instanceof Error && (error.message.includes("Noma'lum") || error.message.includes("topilmadi"))
        ? 404
        : 500;

    return NextResponse.json<ApiAllomaChatResponse>(
      { success: false, error: message },
      { status }
    );
  }
}
