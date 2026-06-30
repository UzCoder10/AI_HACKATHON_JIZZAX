/** GreatFigure seed — safarai schema */
const pg = require("pg");
const { randomUUID } = require("crypto");

const FIGURES = [
  { slug: "mirzo-ulugbek", nameUz: "Mirzo Ulug'bek", nameRu: "Mirzo Ulug'bek", field: "astronomiya va matematika", era: "XV asr", personaPrompt: "Sen Mirzo Ulug'bek — astronom." },
  { slug: "abu-rayhon-beruniy", nameUz: "Abu Rayhon Beruniy", nameRu: "Beruniy", field: "ilm, geografiya", era: "X-XI asr", personaPrompt: "Sen Beruniy — olim." },
  { slug: "ibn-sino", nameUz: "Ibn Sino", nameRu: "Ibn Sino", field: "tibbiyot", era: "X-XI asr", personaPrompt: "Sen Ibn Sino — ulama." },
  { slug: "alisher-navoiy", nameUz: "Alisher Navoiy", nameRu: "Navoiy", field: "adabiyot", era: "XV asr", personaPrompt: "Sen Navoiy — shoir." },
  { slug: "al-xorazmiy", nameUz: "Al-Xorazmiy", nameRu: "Al-Xorazmiy", field: "matematika", era: "IX asr", personaPrompt: "Sen Al-Xorazmiy — matematik." },
  { slug: "amir-temur", nameUz: "Amir Temur", nameRu: "Amir Temur", field: "tarix", era: "XIV-XV asr", personaPrompt: "Sen Amir Temur — tarixiy shaxs." },
  { slug: "imom-al-buxoriy", nameUz: "Imom al-Buxoriy", nameRu: "Imom al-Buxoriy", field: "hadis", era: "IX asr", personaPrompt: "Sen Imom al-Buxoriy — muhaddis." },
];

async function main() {
  const client = new pg.Client({
    connectionString:
      "postgresql://rustamjonorolov:JflYn0EXOb@a1-postgres1.alem.ai:30100/langflow_rustamjonorolov_safartrip",
  });
  await client.connect();

  for (const f of FIGURES) {
    await client.query(
      `INSERT INTO safarai."GreatFigure" (id, slug, "nameUz", "nameRu", field, era, "personaPrompt", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET "nameUz" = EXCLUDED."nameUz", "updatedAt" = NOW()`,
      [randomUUID(), f.slug, f.nameUz, f.nameRu, f.field, f.era, f.personaPrompt]
    );
    console.log("  ok", f.slug);
  }

  const count = await client.query('SELECT COUNT(*)::int AS c FROM safarai."GreatFigure"');
  console.log("GreatFigure jami:", count.rows[0].c);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
