import { PrismaClient } from "@prisma/client";
import { FIGURE_CATALOG } from "../src/lib/rag/figuresCatalog";
import { LESSON_SEED } from "../src/lib/lessons/lessonCatalog";

const prisma = new PrismaClient();

async function main() {
  console.log("GreatFigure seed boshlandi...");

  for (const figure of FIGURE_CATALOG) {
    await prisma.greatFigure.upsert({
      where: { slug: figure.slug },
      update: {
        nameUz: figure.nameUz,
        nameRu: figure.nameRu,
        field: figure.field,
        era: figure.era,
        personaPrompt: figure.personaPrompt,
        isActive: true,
      },
      create: figure,
    });
    console.log(`  ✓ ${figure.slug}`);
  }

  console.log(`Jami ${FIGURE_CATALOG.length} ta shaxs yuklandi.`);

  console.log("LessonTopic seed boshlandi...");
  for (const lesson of LESSON_SEED) {
    const row = await prisma.lessonTopic.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        subject: lesson.subject,
        description: lesson.description,
        youtubeId: lesson.video?.youtubeId ?? null,
        videoTitle: lesson.video?.videoTitle ?? null,
        videoUrl: lesson.video?.videoUrl ?? null,
        videoDurationSeconds: lesson.video?.durationSeconds ?? null,
        status: lesson.status === "active" ? "ACTIVE" : "DRAFT",
        author: lesson.author,
      },
      create: {
        slug: lesson.slug,
        title: lesson.title,
        subject: lesson.subject,
        description: lesson.description,
        youtubeId: lesson.video?.youtubeId ?? null,
        videoTitle: lesson.video?.videoTitle ?? null,
        videoUrl: lesson.video?.videoUrl ?? null,
        videoDurationSeconds: lesson.video?.durationSeconds ?? null,
        status: lesson.status === "active" ? "ACTIVE" : "DRAFT",
        author: lesson.author,
      },
    });

    if (lesson.pausePoints?.length) {
      await prisma.lessonPausePoint.deleteMany({ where: { lessonId: row.id } });
      for (const pp of lesson.pausePoints) {
        await prisma.lessonPausePoint.create({
          data: {
            lessonId: row.id,
            timestampSeconds: pp.timestampSeconds,
            label: pp.label,
            taskType: pp.taskType,
            sortOrder: pp.sortOrder,
            isActive: pp.isActive,
          },
        });
      }
    }

    console.log(`  ✓ dars ${lesson.slug}`);
  }
  console.log(`Jami ${LESSON_SEED.length} ta dars yuklandi.`);
}

main()
  .catch((error) => {
    console.error("Seed xatolik:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
