"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MASCOT_URL } from "@/lib/child/brand";
import { getTalkPersona } from "@/lib/child/childData";
import { CHILD_ROUTES } from "@/lib/child/routes";
import { FIGURE_CATALOG } from "@/lib/rag/figuresCatalog";
import { useChildSession } from "@/lib/child/ChildProvider";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { AqlliShell } from "./AqlliShell";
import { TalkButton, VoiceWaveform } from "./TalkButton";
import { ChildError, ChildLoading } from "./ChildDataState";
import { useReducedMotion } from "./useReducedMotion";

export function ChildTalkView() {
  const reduced = useReducedMotion();
  const searchParams = useSearchParams();
  const figureSlug = searchParams.get("figure") ?? "abu-rayhon-beruniy";
  const { profile, ready, profileError, reloadProfile } = useChildSession();

  const voiceOptions = useMemo(
    () =>
      profile.childId
        ? {
            figureSlug,
            childId: profile.childId,
            age: profile.age,
            name: profile.name,
            language: profile.language,
            enabled: true,
          }
        : null,
    [figureSlug, profile]
  );

  const { state, transcript, reply, error, isListening, toggle, clearError } =
    useVoiceChat(voiceOptions);

  const [persona, setPersona] = useState<{
    slug?: string;
    name: string;
    tagline: string;
    avatarUrl: string;
    sampleTranscript: string;
  } | null>(null);
  const [loadingPersona, setLoadingPersona] = useState(true);

  useEffect(() => {
    setLoadingPersona(true);
    getTalkPersona(figureSlug).then((p) => {
      if (p) setPersona(p);
      setLoadingPersona(false);
    });
  }, [figureSlug]);

  const displayText =
    reply ||
    transcript ||
    (isListening ? persona?.tagline : persona?.sampleTranscript);

  if (!ready || loadingPersona) {
    return (
      <AqlliShell showNav={false}>
        <ChildLoading label="Alloma tayyorlanmoqda..." />
      </AqlliShell>
    );
  }

  if (profileError) {
    return (
      <AqlliShell showNav={false}>
        <ChildError message={profileError} onRetry={() => void reloadProfile()} />
      </AqlliShell>
    );
  }

  return (
    <AqlliShell showNav={!isListening}>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <Link href={CHILD_ROUTES.home} className="text-xl font-bold text-[#705d00]">
          Aqlli Do&apos;st
        </Link>
        <div className="rounded-full bg-[#ece8d9] px-3 py-1 text-xs font-semibold text-[#4d4633]">
          {profile.name}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pb-2">
        {FIGURE_CATALOG.map((figure) => {
          const active = figureSlug === figure.slug;
          return (
            <Link
              key={figure.slug}
              href={CHILD_ROUTES.talkWithFigure(figure.slug)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "bg-[#705d00] text-white"
                  : "bg-[#ece8d9] text-[#4d4633] hover:bg-[#ffd93d]/40"
              }`}
            >
              {figure.nameUz.split(" ").slice(-1)[0]}
            </Link>
          );
        })}
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-32">
        <div className="z-10 mb-8 flex flex-col items-center gap-6">
          <div className="relative">
            {!reduced && <div className="absolute -inset-4 rounded-full bg-[#ffd93d]/20 aqlli-pulse-ring" />}
            <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl md:h-56 md:w-56">
              {persona?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={persona.avatarUrl} alt={persona.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ece8d9]">AI</div>
              )}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#705d00] md:text-[28px]">{persona?.name ?? "..."}</h2>
            <p className="text-base italic text-[#4d4633]">{persona?.tagline}</p>
          </div>
        </div>

        <VoiceWaveform active={isListening || state === "speaking" || state === "processing"} />

        {displayText && (
          <div className="aqlli-sunken z-10 mt-8 w-full max-w-md rounded-2xl border border-[#d0c6ad]/30 bg-[#f8f4e4]/80 p-6 text-center backdrop-blur-md">
            <p className="text-lg italic leading-relaxed text-[#1c1c13]">&ldquo;{displayText}&rdquo;</p>
          </div>
        )}

        {(error || state === "processing") && (
          <div className="z-10 mt-4 max-w-md text-center">
            {state === "processing" && (
              <p className="text-sm font-semibold text-[#705d00]">O&apos;ylayapman...</p>
            )}
            {error && (
              <button
                type="button"
                onClick={clearError}
                className="text-sm text-red-700 underline"
              >
                {error}
              </button>
            )}
          </div>
        )}

        {!reduced && (
          <div className="absolute bottom-40 right-4 h-24 w-24 md:h-32 md:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MASCOT_URL} alt="" className="h-full w-full object-contain drop-shadow-lg" />
          </div>
        )}

        <div className="z-10 mt-8 pb-8">
          <TalkButton
            active={isListening || state === "processing"}
            onClick={toggle}
            hint={false}
            label={
              state === "processing"
                ? "Kutilmoqda..."
                : isListening
                  ? "To'xtatish"
                  : state === "speaking"
                    ? "To'xtatish"
                    : "Gapirish"
            }
            size="md"
          />
        </div>
      </main>
    </AqlliShell>
  );
}
