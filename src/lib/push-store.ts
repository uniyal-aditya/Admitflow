import { prisma } from "@/lib/db/prisma";

interface PushSubData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function addSubscription(userId: string, endpoint: string, p256dh: string, auth: string) {
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId, p256dh, auth },
    create: { userId, endpoint, p256dh, auth },
  });
}

export async function removeSubscription(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

export async function getSubscriptionsByUser(userId: string): Promise<PushSubData[]> {
  return prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  }) as Promise<PushSubData[]>;
}
