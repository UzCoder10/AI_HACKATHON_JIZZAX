import { PrismaClient } from "@prisma/client";
import { FIGURE_CATALOG } from "../src/lib/rag/figuresCatalog";

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
}

main()
  .catch((error) => {
    console.error("Seed xatolik:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
