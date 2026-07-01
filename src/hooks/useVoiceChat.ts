"use client";

import { useCallback, useRef, useState } from "react";
import {
  getAllomaSessionId,
  postAllomaVoiceChat,
  figureSlugToAllomaId,
} from "@/lib/child/childData";
import { ApiError } from "@/lib/api/fetchJson";
import { BrowserWavRecorder } from "@/lib/voice/wavRecorder";

export type VoiceChatState = "idle" | "listening" | "processing" | "speaking";

export interface UseVoiceChatOptions {
  figureSlug: string;
  childId: string;
  age: number;
  name: string;
  language: "uz" | "ru";
  enabled?: boolean;
}

export function useVoiceChat(options: UseVoiceChatOptions | null) {
  const [state, setState] = useState<VoiceChatState>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<BrowserWavRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const playReplyAudio = useCallback((base64: string, mimeType: string) => {
    stopPlayback();
    const audio = new Audio(`data:${mimeType};base64,${base64}`);
    audioRef.current = audio;
    audio.onended = () => {
      setState("idle");
      audioRef.current = null;
    };
    audio.onerror = () => {
      setState("idle");
      setError("Javob ovozini ijro etib bo'lmadi");
    };
    setState("speaking");
    void audio.play().catch(() => {
      setState("idle");
      setError("Javob ovozini ijro etib bo'lmadi");
    });
  }, [stopPlayback]);

  const startListening = useCallback(async () => {
    if (!options || options.enabled === false) return;

    setError(null);
    setReply("");
    stopPlayback();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Bu qurilmada mikrofon qo'llab-quvvatlanmaydi");
      return;
    }

    try {
      const recorder = new BrowserWavRecorder();
      await recorder.start();
      recorderRef.current = recorder;
      setState("listening");
      setTranscript("");
    } catch {
      setError("Mikrofon ruxsati kerak. Sozlamalardan ruxsat bering.");
      setState("idle");
    }
  }, [options, stopPlayback]);

  const stopListening = useCallback(async () => {
    if (!options || state !== "listening" || !recorderRef.current) return;

    setState("processing");

    const recorder = recorderRef.current;
    recorderRef.current = null;

    let blob: Blob;
    try {
      blob = await recorder.stop();
    } catch {
      setError("Ovoz yozib bo'lmadi. Qayta urinib ko'ring.");
      setState("idle");
      return;
    }

    if (blob.size < 512) {
      setError("Ovoz juda qisqa — iltimos qayta gapiring");
      setState("idle");
      return;
    }

    const allomaId = figureSlugToAllomaId(options.figureSlug);
    const sessionId = getAllomaSessionId(allomaId);

    try {
      const result = await postAllomaVoiceChat({
        allomaId,
        audio: blob,
        childId: options.childId,
        age: options.age,
        name: options.name,
        language: options.language,
        sessionId,
        filename: "recording.wav",
      });

      setTranscript(result.questionText);
      setReply(result.reply);

      if (result.audioBase64) {
        playReplyAudio(result.audioBase64, result.audioMimeType);
      } else {
        setState("idle");
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Suhbatda xatolik. Keyinroq urinib ko'ring.";
      setError(message);
      setState("idle");
    }
  }, [options, state, playReplyAudio]);

  const toggle = useCallback(() => {
    if (state === "idle") void startListening();
    else if (state === "listening") void stopListening();
    else {
      stopPlayback();
      setState("idle");
    }
  }, [state, startListening, stopListening, stopPlayback]);

  return {
    state,
    transcript,
    reply,
    error,
    isActive: state === "listening" || state === "processing" || state === "speaking",
    isListening: state === "listening",
    startListening,
    stopListening,
    toggle,
    clearError: () => setError(null),
  };
}
