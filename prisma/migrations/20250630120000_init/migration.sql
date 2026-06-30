-- SafarAI init — faqat safarai schema. public/LangFlow jadvallariga TEGMAYDI.

CREATE SCHEMA IF NOT EXISTS "safarai";

-- Enums
CREATE TYPE "safarai"."SafetySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "safarai"."SafetySource" AS ENUM ('INPUT', 'OUTPUT', 'CRISIS');
CREATE TYPE "safarai"."ConversationStatus" AS ENUM ('ACTIVE', 'ENDED');
CREATE TYPE "safarai"."ConversationMode" AS ENUM ('STANDARD', 'GREAT_FIGURE');
CREATE TYPE "safarai"."InsightAlertType" AS ENUM ('PROLONGED_LOW_MOOD', 'MOOD_DECLINE', 'GENERAL');
CREATE TYPE "safarai"."InsightSeverity" AS ENUM ('LOW', 'MEDIUM');
CREATE TYPE "safarai"."PaymentProvider" AS ENUM ('PAYME', 'CLICK');
CREATE TYPE "safarai"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'FAILED');

-- Tables
CREATE TABLE "safarai"."GreatFigure" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "era" TEXT,
    "personaPrompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GreatFigure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."Conversation" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "childName" TEXT,
    "childAge" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "mode" "safarai"."ConversationMode" NOT NULL DEFAULT 'STANDARD',
    "figureId" TEXT,
    "status" "safarai"."ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filtered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."SafetyEvent" (
    "id" TEXT NOT NULL,
    "childId" TEXT,
    "sessionId" TEXT,
    "source" "safarai"."SafetySource" NOT NULL,
    "severity" "safarai"."SafetySeverity" NOT NULL,
    "category" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafetyEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."MoodEntry" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT,
    "entryDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."InsightAlert" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "type" "safarai"."InsightAlertType" NOT NULL,
    "severity" "safarai"."InsightSeverity" NOT NULL,
    "summary" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InsightAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."InsightReport" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "moodTrend" TEXT NOT NULL,
    "moodSummary" TEXT NOT NULL,
    "interests" TEXT[],
    "activitySummary" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InsightReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."Parent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "pinHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."Child" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'uz',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."ParentSettings" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "screenTimeMinutes" INTEGER NOT NULL DEFAULT 60,
    "contentLevel" TEXT NOT NULL DEFAULT 'standard',
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'free',
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionExpiresAt" TIMESTAMP(3),
    CONSTRAINT "ParentSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safarai"."PaymentTransaction" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "provider" "safarai"."PaymentProvider" NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "merchantTransId" TEXT NOT NULL,
    "providerTransId" TEXT,
    "status" "safarai"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "GreatFigure_slug_key" ON "safarai"."GreatFigure"("slug");
CREATE INDEX "GreatFigure_slug_idx" ON "safarai"."GreatFigure"("slug");
CREATE INDEX "Conversation_childId_idx" ON "safarai"."Conversation"("childId");
CREATE INDEX "Conversation_status_idx" ON "safarai"."Conversation"("status");
CREATE INDEX "Conversation_figureId_idx" ON "safarai"."Conversation"("figureId");
CREATE INDEX "Conversation_mode_idx" ON "safarai"."Conversation"("mode");
CREATE INDEX "Message_conversationId_idx" ON "safarai"."Message"("conversationId");
CREATE INDEX "SafetyEvent_childId_idx" ON "safarai"."SafetyEvent"("childId");
CREATE INDEX "SafetyEvent_createdAt_idx" ON "safarai"."SafetyEvent"("createdAt");
CREATE INDEX "MoodEntry_childId_idx" ON "safarai"."MoodEntry"("childId");
CREATE INDEX "MoodEntry_entryDate_idx" ON "safarai"."MoodEntry"("entryDate");
CREATE UNIQUE INDEX "MoodEntry_childId_entryDate_key" ON "safarai"."MoodEntry"("childId", "entryDate");
CREATE INDEX "InsightAlert_childId_idx" ON "safarai"."InsightAlert"("childId");
CREATE INDEX "InsightAlert_createdAt_idx" ON "safarai"."InsightAlert"("createdAt");
CREATE INDEX "InsightReport_childId_idx" ON "safarai"."InsightReport"("childId");
CREATE INDEX "InsightReport_periodStart_idx" ON "safarai"."InsightReport"("periodStart");
CREATE UNIQUE INDEX "Parent_email_key" ON "safarai"."Parent"("email");
CREATE INDEX "Child_parentId_idx" ON "safarai"."Child"("parentId");
CREATE UNIQUE INDEX "ParentSettings_parentId_key" ON "safarai"."ParentSettings"("parentId");
CREATE UNIQUE INDEX "PaymentTransaction_merchantTransId_key" ON "safarai"."PaymentTransaction"("merchantTransId");
CREATE INDEX "PaymentTransaction_parentId_idx" ON "safarai"."PaymentTransaction"("parentId");
CREATE INDEX "PaymentTransaction_status_idx" ON "safarai"."PaymentTransaction"("status");

-- Foreign keys (faqat safarai ichida)
ALTER TABLE "safarai"."Conversation" ADD CONSTRAINT "Conversation_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "safarai"."GreatFigure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safarai"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "safarai"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safarai"."Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "safarai"."Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safarai"."ParentSettings" ADD CONSTRAINT "ParentSettings_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "safarai"."Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
