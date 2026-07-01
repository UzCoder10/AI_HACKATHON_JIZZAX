import { NextRequest, NextResponse } from "next/server";
import { transcribeVoiceAudio, VoiceError } from "@/lib/voice/voiceService";
import type { ApiTranscribeResponse } from "@/types/voice";
import type { AppLanguage } from "@/types/safety";

export const runtime = "nodejs";
export const maxDuration = 60;

function voiceErrorStatus(code: VoiceError["code"]): number {
  if (code === "config") return 503;
  if (code === "invalid_audio" || code === "empty_transcript") return 400;
  return 502;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("audio");

    if (!(file instanceof Blob)) {
      return NextResponse.json<ApiTranscribeResponse>(
        { success: false, error: "audio fayli talab qilinadi (multipart field: audio)" },
        { status: 400 }
      );
    }

    const languageRaw = String(form.get("language") ?? "uz").trim();
    const language: AppLanguage = languageRaw === "ru" ? "ru" : "uz";

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file instanceof File ? file.name : "recording.webm";
    const mimeType = file.type || undefined;

    const result = await transcribeVoiceAudio(buffer, {
      language,
      mimeType,
      filename,
    });

    return NextResponse.json<ApiTranscribeResponse>({ success: true, data: result });
  } catch (error) {
    console.error("[POST /api/voice/transcribe]", error);

    if (error instanceof VoiceError) {
      return NextResponse.json<ApiTranscribeResponse>(
        { success: false, error: error.message },
        { status: voiceErrorStatus(error.code) }
      );
    }

    return NextResponse.json<ApiTranscribeResponse>(
      { success: false, error: "Transkripsiya xatolik. Keyinroq urinib ko'ring." },
      { status: 500 }
    );
  }
}
