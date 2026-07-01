-- LessonTopic + LessonPausePoint (YouTube dars videolari)

CREATE TYPE "LessonStatus" AS ENUM ('DRAFT', 'ACTIVE');

CREATE TABLE "LessonTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "youtubeId" TEXT,
    "videoTitle" TEXT,
    "videoUrl" TEXT,
    "videoDurationSeconds" INTEGER,
    "status" "LessonStatus" NOT NULL DEFAULT 'DRAFT',
    "author" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonPausePoint" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "timestampSeconds" INTEGER NOT NULL,
    "label" TEXT,
    "taskType" TEXT NOT NULL DEFAULT 'ai_task',
    "taskPayload" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPausePoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonTopic_slug_key" ON "LessonTopic"("slug");
CREATE INDEX "LessonTopic_status_idx" ON "LessonTopic"("status");
CREATE INDEX "LessonTopic_slug_idx" ON "LessonTopic"("slug");
CREATE INDEX "LessonPausePoint_lessonId_idx" ON "LessonPausePoint"("lessonId");

ALTER TABLE "LessonPausePoint" ADD CONSTRAINT "LessonPausePoint_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
