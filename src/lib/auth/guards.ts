import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

export async function requireParentSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const parent = await prisma.parent.findUnique({
    where: { id: session.parentId },
    include: { settings: true, children: { orderBy: { createdAt: "desc" } } },
  });

  if (!parent) {
    throw new Error("UNAUTHORIZED");
  }

  return { session, parent };
}

export async function getParentChild(parentId: string, childId: string) {
  return prisma.child.findFirst({
    where: { id: childId, parentId },
  });
}

export async function ensureParentSettings(parentId: string) {
  return prisma.parentSettings.upsert({
    where: { parentId },
    update: {},
    create: { parentId },
  });
}
