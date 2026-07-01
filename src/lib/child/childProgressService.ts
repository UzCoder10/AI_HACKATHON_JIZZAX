import { prisma } from "@/lib/db/client";
import type { ChildBadge, ChildProgressData } from "@/lib/child/aqlliTypes";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTEJ8vXKmCtGFu8KZMI7pHEv7mZ07UXMsHoPW3dIBe4GTy_QuIuZ_d8NRkke3FuQ5Lv7foKYemwIT7QoKalpmhhdIt9V0plsQaYyYYW5ZGvhQHTyKTtXXK8Co-631jvZlYjKSHwKlzRLyssLdkgW9ZYf9-L_Ojb3CoYyYBXpXSQzfae7ZHSfW7Xn7R7rSI69_CX8Iw1Hb-1FSSW4spe-njLpSEJhMIpz0bIIuOAMpCj2vCy8iTt8r_PxSwGEkCu3cZfMdvtJV9osw";

function computeStreakDays(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const dayKeys = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getChildProfileRecord(childId: string) {
  return prisma.child.findUnique({ where: { id: childId } });
}

export async function buildChildProgress(childId: string): Promise<ChildProgressData | null> {
  const child = await getChildProfileRecord(childId);
  if (!child) return null;

  const [messageCount, moodEntries, conversations] = await Promise.all([
    prisma.message.count({
      where: { conversation: { childId } },
    }),
    prisma.moodEntry.findMany({
      where: { childId },
      orderBy: { entryDate: "desc" },
      take: 30,
    }),
    prisma.conversation.findMany({
      where: { childId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { updatedAt: true, createdAt: true },
    }),
  ]);

  const xp = messageCount * 15 + moodEntries.length * 25 + conversations.length * 10;
  const xpToNextLevel = 300;
  const level = Math.max(1, Math.floor(xp / xpToNextLevel) + 1);
  const xpCurrentLevel = xp % xpToNextLevel;

  const activityDates = [
    ...moodEntries.map((m) => m.entryDate),
    ...conversations.map((c) => c.updatedAt),
  ];

  return {
    name: child.name,
    avatarUrl: DEFAULT_AVATAR,
    xp,
    level,
    streakDays: computeStreakDays(activityDates),
    xpToNextLevel,
    xpCurrentLevel,
    avgResponseSeconds: messageCount > 0 ? 12 : 0,
  };
}

export async function buildChildBadges(childId: string): Promise<ChildBadge[]> {
  const progress = await buildChildProgress(childId);
  if (!progress) return [];

  const [figureChats, lessonViews] = await Promise.all([
    prisma.conversation.count({
      where: { childId, mode: "GREAT_FIGURE" },
    }),
    prisma.conversation.count({ where: { childId } }),
  ]);

  return [
    {
      id: "b-beruniy",
      title: "Beruniy shogirdi",
      subtitle: "10 ta dars",
      icon: "auto_stories",
      color: "#705d00",
      locked: figureChats < 1,
    },
    {
      id: "b-streak",
      title: "5 kunlik Streak",
      subtitle: "To'xtovsiz!",
      icon: "local_fire_department",
      color: "#fd761a",
      locked: progress.streakDays < 5,
    },
    {
      id: "b-listener",
      title: "Oltin quloq",
      subtitle: "Yaxshi tinglovchi",
      icon: "hearing",
      color: "#005db8",
      locked: lessonViews < 3,
    },
    {
      id: "b-math",
      title: "Matematik",
      subtitle: "Yaqinda...",
      icon: "lock",
      color: "#7e7761",
      locked: true,
    },
  ];
}
