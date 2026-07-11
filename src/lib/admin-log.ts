import { prisma } from "@/lib/db/prisma";

export async function logAdminAction(action: string, details?: string, adminEmail?: string) {
  try {
    await prisma.adminLog.create({
      data: {
        action,
        details: details || null,
        adminEmail: adminEmail || null,
      },
    });
  } catch {}
}
