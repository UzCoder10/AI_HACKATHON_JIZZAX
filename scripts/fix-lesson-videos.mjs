/** DB dagi eski/buzilgan YouTube ID larni yangilash */
import pg from "pg";

const UPDATES = [
  {
    slug: "l-001",
    youtubeId: "fN1Cyr0ZK9M",
    videoTitle: "Hello Hello! Can You Clap Your Hands? | Super Simple Songs",
    videoUrl: "https://www.youtube.com/watch?v=fN1Cyr0ZK9M",
    videoDurationSeconds: 152,
  },
  {
    slug: "l-003",
    youtubeId: "jYAWf8Y91hA",
    videoTitle: "I See Something Blue | Colors Song for Children | Super Simple Songs",
    videoUrl: "https://www.youtube.com/watch?v=jYAWf8Y91hA",
    videoDurationSeconds: 183,
    activate: true,
  },
  {
    slug: "l-002",
    youtubeId: "DgJ2gDxjsmQ",
    videoTitle: "Wild Animals Vocabulary for Kids",
    videoUrl: "https://www.youtube.com/watch?v=DgJ2gDxjsmQ",
    videoDurationSeconds: 480,
  },
  {
    slug: "l-004",
    youtubeId: "libKVRa01L8",
    videoTitle: "Solar System 101 | National Geographic",
    videoUrl: "https://www.youtube.com/watch?v=libKVRa01L8",
    videoDurationSeconds: 251,
  },
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

for (const u of UPDATES) {
  const r = await client.query(
    `UPDATE safarai."LessonTopic"
     SET "youtubeId" = $1, "videoTitle" = $2, "videoUrl" = $3, "videoDurationSeconds" = $4,
         "status" = CASE WHEN $6 THEN 'ACTIVE'::safarai."LessonStatus" ELSE "status" END,
         "updatedAt" = NOW()
     WHERE slug = $5
     RETURNING slug, "youtubeId", "status"`,
    [u.youtubeId, u.videoTitle, u.videoUrl, u.videoDurationSeconds, u.slug, u.activate ?? false]
  );
  console.log(r.rowCount ? `✓ ${u.slug} → ${u.youtubeId}` : `⚠ ${u.slug} topilmadi`);
}

await client.end();
