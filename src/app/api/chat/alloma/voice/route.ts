import { NextRequest, NextResponse } from "next/server";
import { runAllomaVoiceChat, VoiceError } from "@/lib/voice/voiceService";
import { isKnownAllomaId } from "@/lib/rag/allomaIds";
import { assertAllomaChatAccess } from "@/lib/rag/allomaAccess";
import type { ApiAllomaVoiceChatResponse } from "@/types/voice";
import type { AppLanguage } from "@/types/safety";

export const runtime = "nodejs";
export const maxDuration = 120;

function voiceErrorStatus(code: VoiceError["code"]): number {
  if (code === "config") return 503;
  if (code === "invalid_audio" || code === "empty_transcript") return 400;
  return 502;
}

function parseIntField(value: FormDataEntryValue | null, fallback?: number): number | undefined {
  if (value == null || value === "") return fallback;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("audio");
    const allomaId = String(form.get("alloma_id") ?? "").trim();
    const childId = String(form.get("child_id") ?? form.get("childId") ?? "").trim();
    const sessionId = String(form.get("session_id") ?? "").trim() || undefined;
    const name = String(form.get("name") ?? "").trim();
    const languageRaw = String(form.get("language") ?? "uz").trim();
    const language: AppLanguage = languageRaw === "ru" ? "ru" : "uz";
    const age = parseIntField(form.get("age"));

    if (!(file instanceof Blob)) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: "audio fayli talab qilinadi" },
        { status: 400 }
      );
    }
    if (!allomaId) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: "alloma_id talab qilinadi" },
        { status: 400 }
      );
    }
    if (!isKnownAllomaId(allomaId)) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: `Noma'lum alloma: ${allomaId}` },
        { status: 400 }
      );
    }
    if (!childId) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: "child_id talab qilinadi" },
        { status: 400 }
      );
    }
    if (!age || age < 7 || age > 12) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: "age 7–12 oralig'ida bo'lishi kerak" },
        { status: 400 }
      );
    }

    const access = await assertAllomaChatAccess(childId, allomaId);
    if (!access.allowed) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: access.reason },
        { status: access.status }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file instanceof File ? file.name : "recording.webm";

    const result = await runAllomaVoiceChat({
      allomaId,
      audio: buffer,
      audioMimeType: file.type || undefined,
      audioFilename: filename,
      sessionId,
      childId,
      age,
      name,
      language,
    });

    return NextResponse.json<ApiAllomaVoiceChatResponse>({ success: true, data: result });
  } catch (error) {
    console.error("[POST /api/chat/alloma/voice]", error);

    if (error instanceof VoiceError) {
      return NextResponse.json<ApiAllomaVoiceChatResponse>(
        { success: false, error: error.message },
        { status: voiceErrorStatus(error.code) }
      );
    }

    const message =
      error instanceof Error && (error.message.includes("Noma'lum") || error.message.includes("topilmadi"))
        ? error.message
        : "Ovozli suhbatda xatolik. Keyinroq urinib ko'ring.";
    const status =
      error instanceof Error && (error.message.includes("Noma'lum") || error.message.includes("topilmadi"))
        ? 404
        : 500;

    return NextResponse.json<ApiAllomaVoiceChatResponse>(
      { success: false, error: message },
      { status }
    );
  }
}
