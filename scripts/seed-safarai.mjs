/** GreatFigure seed — safarai schema, pg orqali */
import pg from "pg";
import { randomUUID } from "crypto";

// Katalog ma'lumotlari (figuresCatalog.ts dan)
const FIGURES = [
  { slug: "mirzo-ulugbek", nameUz: "Mirzo Ulug'bek", nameRu: "Мирzo Ulug'bek", field: "astronomiya va matematika", era: "XV asr", personaPrompt: "Sen Mirzo Ulug'bek — buyuk astronom va Samarqand rasadxonasi asoschisisan.\nYulduzlar, sayyoralar, rasadxonalar va ilmiy kashfiyotlar haqida gapirasan." },
  { slug: "abu-rayhon-beruniy", nameUz: "Abu Rayhon Beruniy", nameRu: "Абу Райхон Бeruniy", field: "ilm, geografiya va astronomiya", era: "X–XI asr", personaPrompt: "Sen Abu Rayhon Beruniy — olim, geograf va astronomsan.\nYer shakli, masofalar o'lchash va ilmiy uslub haqida faktlar bilan gapirasan." },
  { slug: "ibn-sino", nameUz: "Ibn Sino", nameRu: "Иbn Сино", field: "tibbiyot va falsafa", era: "X–XI asr", personaPrompt: "Sen Ibn Sino (Avitsenna) — tibbiyot va falsafa ulamisan.\nTibbiy tashxis yoki davolash tavsiya qilmaysan — faqat tarixiy ilmiy ma'lumot berarsan." },
  { slug: "alisher-navoiy", nameUz: "Alisher Navoiy", nameRu: "Алишер Navoiy", field: "adabiyot va madaniyat", era: "XV asr", personaPrompt: "Sen Alisher Navoiy — buyuk shoir va mutafakkirsan.\nShe'riyat, til va adabiyot haqida ta'limiy tarzda gapirasan." },
  { slug: "al-xorazmiy", nameUz: "Al-Xorazmiy", nameRu: "Ал-Хорезми", field: "matematika va algoritmlar", era: "IX asr", personaPrompt: "Sen Al-Xorazmiy — matematika va algoritmlar otasi sanalasan.\nRaqamlar, algebra va mantiqiy fikrlash haqida sodda tushuntirasan." },
  { slug: "amir-temur", nameUz: "Amir Temur", nameRu: "Амир Temur", field: "tarix va davlatchilik", era: "XIV–XV asr", personaPrompt: "Sen Amir Temur — tarixiy davlat arbobi sanalasan.\nTarix va madaniyat haqida faktlarga asoslangan, zo'ravonlikni romantizatsiya qilmasdan gapirasan." },
  { slug: "imom-al-buxoriy", nameUz: "Imom al-Buxoriy", nameRu: "Имam al-Buxoriy", field: "hadis va islomiy ilm", era: "IX asr", personaPrompt: "Sen Imom al-Buxoriy — hadis va ilm izlanuvchisisan.\nIlm olish, halollik va bilim qadriga hurmat haqida hikmatli gapirasan." },
];

async function main() {
  const client = new pg.Client({
    connectionString:
      "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip",
  });
  await client.connect();

  for (const f of FIGURES) {
    const id = randomUUID();
    await client.query(
      `INSERT INTO safarai."GreatFigure" (id, slug, "nameUz", "nameRu", field, era, "personaPrompt", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         "nameUz" = EXCLUDED."nameUz",
         "nameRu" = EXCLUDED."nameRu",
         field = EXCLUDED.field,
         era = EXCLUDED.era,
         "personaPrompt" = EXCLUDED."personaPrompt",
         "isActive" = true,
         "updatedAt" = NOW()`,
      [id, f.slug, f.nameUz, f.nameRu, f.field, f.era, f.personaPrompt]
    );
    console.log("  ✓", f.slug);
  }

  const count = await client.query(`SELECT COUNT(*)::int AS c FROM safarai."GreatFigure"`);
  console.log("GreatFigure jami:", count.rows[0].c);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
