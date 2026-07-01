"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getLessonById } from "@/lib/child/childData";
import type { ChildLesson } from "@/lib/child/aqlliTypes";
import { CHILD_ROUTES } from "@/lib/child/routes";
import { useChildSession } from "@/lib/child/ChildProvider";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { SafeYoutubeEmbed } from "@/components/video/SafeYoutubeEmbed";
import { formatDuration } from "@/lib/youtube";
import { AqlliShell } from "./AqlliShell";
import { AqlliIcon } from "./AqlliIcon";
import { ChildEmpty, ChildError, ChildLoading } from "./ChildDataState";

export function ChildLessonView({ lessonId }: { lessonId: string }) {
  const { profile, ready, profileError, reloadProfile } = useChildSession();
  const [lesson, setLesson] = useState<ChildLesson | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const voiceFigure =
    lesson?.subject === "figures" || lesson?.id === "l-004"
      ? "abu-rayhon-beruniy"
      : null;

  const voiceOptions = useMemo(
    () =>
      voiceFigure && profile.childId
        ? {
            figureSlug: voiceFigure,
            childId: profile.childId,
            age: profile.age,
            name: profile.name,
            language: profile.language,
            enabled: true,
          }
        : null,
    [voiceFigure, profile]
  );

  const { toggle, isListening, error: voiceError, state: voiceState } = useVoiceChat(voiceOptions);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLessonById(lessonId);
      if (!data) {
        setError("Bu dars topilmadi yoki hozircha ochilmagan.");
        setLesson(null);
      } else {
        setLesson(data);
        setQuestionIndex(0);
        setCompletedSteps(data.completedSteps);
        setSelected(null);
      }
    } catch {
      setError("Dars yuklanmadi. Internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const questions = lesson?.questions ?? [];
  const currentQuestion =
    questions[questionIndex] ??
    (lesson?.question && lesson.choices
      ? { id: "single", question: lesson.question, choices: lesson.choices }
      : null);
  const totalSteps = questions.length > 0 ? questions.length : lesson?.totalSteps ?? 0;
  const isLastQuestion = questions.length > 0 && questionIndex >= questions.length - 1;
  const selectedChoice = currentQuestion?.choices.find((c) => c.id === selected);
  const isCorrect = selectedChoice?.correct === true;

  const handleNext = () => {
    if (!selected || !currentQuestion) return;
    const nextCompleted = Math.max(completedSteps, questionIndex + 1);
    setCompletedSteps(nextCompleted);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (!ready || loading) {
    return (
      <AqlliShell showNav={false}>
        <ChildLoading />
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

  if (error || !lesson) {
    return (
      <AqlliShell showNav={false}>
        <ChildError message={error ?? "Dars topilmadi"} onRetry={() => void load()} />
      </AqlliShell>
    );
  }

  const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <AqlliShell showNav={false}>
      <header className="sticky top-0 z-50 bg-[#fdf9e9] px-5 pb-2 pt-4">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={CHILD_ROUTES.home}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece8d9] active:scale-95"
              aria-label="Orqaga"
            >
              <AqlliIcon name="arrow_back" className="text-[#705d00]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#705d00]">{lesson.title}</h1>
          </div>
          <div className="rounded-full bg-[#ffd93d] px-4 py-1 text-base font-bold text-[#725e00]">
            {completedSteps} / {totalSteps}
          </div>
        </div>
        <div className="aqlli-sunken relative mt-4 h-6 overflow-hidden rounded-full bg-[#ece8d9]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#705d00] to-[#ffd93d] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col items-center px-5 py-6 pb-24">
        {lesson.video ? (
          <section className="mb-8 w-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#705d00]">{lesson.video.title}</h2>
              {lesson.video.durationSeconds ? (
                <span className="rounded-full bg-[#ece8d9] px-3 py-1 text-sm font-semibold text-[#4d4633]">
                  {formatDuration(lesson.video.durationSeconds)}
                </span>
              ) : null}
            </div>
            <SafeYoutubeEmbed
              youtubeId={lesson.video.youtubeId}
              title={lesson.video.title}
              pausePoints={lesson.pausePoints}
            />
          </section>
        ) : null}

        {(lesson.mascotLine || currentQuestion) && (
          <section className="aqlli-bubbly mb-8 w-full rounded-2xl border-2 border-white/50 bg-[#f8f4e4] p-6 text-center">
            {lesson.mascotLine && (
              <p className="mb-2 text-lg text-[#1c1c13]">&ldquo;{lesson.mascotLine}&rdquo;</p>
            )}
            {questions.length > 1 && (
              <p className="mb-2 text-sm font-semibold text-[#7e7761]">
                Savol {questionIndex + 1} / {questions.length}
              </p>
            )}
            {currentQuestion && (
              <p className="text-2xl font-bold text-[#705d00]">{currentQuestion.question}</p>
            )}
          </section>
        )}

        {currentQuestion && currentQuestion.choices.length > 0 ? (
          <div className="grid w-full gap-4">
            {currentQuestion.choices.map((choice) => {
              const isSelected = selected === choice.id;
              const showResult = Boolean(selected);
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => {
                    setSelected(choice.id);
                    if (isLastQuestion) {
                      setCompletedSteps(totalSteps);
                    }
                  }}
                  className={`aqlli-bubbly flex w-full items-center justify-between rounded-2xl border-2 px-6 py-4 transition-all active:scale-95 ${
                    isSelected
                      ? choice.correct
                        ? "border-green-600 bg-gradient-to-r from-green-100 to-green-50"
                        : "border-red-400 bg-gradient-to-r from-red-50 to-red-100/50"
                      : "border-transparent bg-[#e6e3d3] hover:border-[#705d00]/30"
                  }`}
                >
                  <span className="text-xl font-semibold">{choice.label}</span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      isSelected
                        ? choice.correct
                          ? "bg-green-600"
                          : "bg-red-500"
                        : "border-2 border-[#7e7761]"
                    }`}
                  >
                    {isSelected && (
                      <AqlliIcon
                        name={showResult && !choice.correct ? "close" : "check"}
                        className="!text-lg text-white"
                      />
                    )}
                  </div>
                </button>
              );
            })}

            {selected && questions.length > 0 && !isLastQuestion ? (
              <button
                type="button"
                onClick={handleNext}
                className="aqlli-bubbly mt-2 w-full rounded-2xl bg-gradient-to-r from-[#705d00] to-[#ffd93d] px-6 py-4 text-lg font-bold text-white active:scale-95"
              >
                Keyingi savol →
              </button>
            ) : null}

            {selected && isLastQuestion ? (
              <p className="mt-2 text-center text-lg font-bold text-[#705d00]">
                {isCorrect ? "🎉 Ajoyib! Barcha savollarni tugatding!" : "✓ Dars yakunlandi!"}
              </p>
            ) : null}
          </div>
        ) : (
          <ChildEmpty message="Bu darsda hali savollar qo'shilmagan." />
        )}

        {voiceFigure ? (
          <div className="mt-12 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={toggle}
              disabled={voiceState === "processing"}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd93d] to-[#705d00] shadow-lg active:scale-95 disabled:opacity-60"
              aria-label="Ovozli savol"
            >
              <AqlliIcon
                name={isListening ? "graphic_eq" : "mic"}
                filled
                size="lg"
                className="text-white"
              />
            </button>
            <p className="text-sm font-bold uppercase tracking-widest text-[#4d4633]">
              Beruniyga ovozli savol
            </p>
            {voiceError ? <p className="text-sm text-red-700">{voiceError}</p> : null}
          </div>
        ) : null}
      </main>
    </AqlliShell>
  );
}
