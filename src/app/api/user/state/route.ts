import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * One round trip for the client's personal state. 401 means "guest": the
 * client falls back to localStorage (guest state never touches the DB).
 */
export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [favorites, settings, downloads] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: session.id },
        select: { collegeId: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.userSettings.findUnique({ where: { userId: session.id } }),
      prisma.download.findMany({
        where: { userId: session.id },
        orderBy: { downloadedAt: "desc" },
        take: 200,
      }),
    ]);

    return NextResponse.json({
      favorites: favorites.map((f) => f.collegeId),
      settings: settings
        ? {
            notificationTypes: settings.notificationTypes.split(","),
            scanFrequency: settings.scanFrequency,
            language: settings.language,
            emailNotifications: settings.emailNotifications,
            deviceNotifications: settings.deviceNotifications,
          }
        : null,
      downloads,
    });
  } catch (err) {
    console.error("GET /api/user/state error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
