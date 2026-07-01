import type { ChildLesson } from "@/lib/child/aqlliTypes";

import type { LessonRecord } from "@/types/lesson";

import { getLessonQuiz } from "@/lib/lessons/lessonQuizzes";



const SUBJECT_MAP: Record<string, ChildLesson["subject"]> = {

  "Ingliz tili": "english",

  Astronomiya: "figures",

  "Buyuk Siymolar": "figures",

};



const COLOR_MAP: Record<string, ChildLesson["color"]> = {

  "Ingliz tili": "secondary",

  Astronomiya: "primary",

};



export function lessonRecordToChildLesson(record: LessonRecord): ChildLesson {

  const questions = getLessonQuiz(record.slug);

  const first = questions[0];



  return {

    id: record.slug,

    title: record.title,

    subject: SUBJECT_MAP[record.subject] ?? "english",

    icon: record.video ? "play_circle" : "menu_book",

    color: COLOR_MAP[record.subject] ?? "secondary",

    totalSteps: questions.length > 0 ? questions.length : 5,

    completedSteps: 0,

    video: record.video

      ? {

          youtubeId: record.video.youtubeId,

          title: record.video.videoTitle,

          durationSeconds: record.video.durationSeconds,

        }

      : undefined,

    pausePoints: record.pausePoints?.map((p) => ({

      id: p.id,

      timestampSeconds: p.timestampSeconds,

      label: p.label,

      taskType: p.taskType,

    })),

    mascotLine: record.video

      ? "Avval videoni tomosha qiling, keyin savollarga javob bering!"

      : questions.length > 0

        ? "Savollarga javob ber va bilimingni sinab ko'r!"

        : undefined,

    questions: questions.length > 0 ? questions : undefined,

    question: first?.question,

    choices: first?.choices,

  };

}


