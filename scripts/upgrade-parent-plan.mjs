import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const childId = process.argv[2] ?? "cmr1slbk60004fubsqdzib3li";
const plan = process.argv[3] ?? "family";

const child = await prisma.child.findUnique({
  where: { id: childId },
  include: { parent: { include: { settings: true } } },
});

if (!child) {
  console.error("Bola topilmadi:", childId);
  process.exit(1);
}

const expires = new Date();
expires.setDate(expires.getDate() + 30);

const settings = await prisma.parentSettings.upsert({
  where: { parentId: child.parentId },
  update: {
    subscriptionPlan: plan,
    subscriptionActive: true,
    subscriptionExpiresAt: expires,
  },
  create: {
    parentId: child.parentId,
    subscriptionPlan: plan,
    subscriptionActive: true,
    subscriptionExpiresAt: expires,
  },
});

console.log("Parent:", child.parent.email ?? child.parent.id);
console.log(
  "Plan:",
  settings.subscriptionPlan,
  "active:",
  settings.subscriptionActive,
  "expires:",
  settings.subscriptionExpiresAt?.toISOString()
);

await prisma.$disconnect();
