import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function checkAdmin() {
  if (!ADMIN_EMAIL) {
    return { authorized: false, reason: "ADMIN_EMAIL not configured" } as const;
  }
  const session = await getSession();
  if (!session || session.email !== ADMIN_EMAIL) {
    return { authorized: false, reason: "Unauthorized" } as const;
  }
  return { authorized: true, session } as const;
}

export async function GET() {
  try {
    const auth = await checkAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: auth.reason === "ADMIN_EMAIL not configured" ? 500 : 401 });
    }

    // Dataset aggregates now come from the canonical tables (the static
    // files no longer back any server data path).
    const now = new Date();
    const [collegeTypeRows, collegeOwnershipRows, noticeTypeRows, collegeTotal, noticeTotal, activeNotices] = await Promise.all([
      prisma.college.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.college.groupBy({ by: ["ownership"], _count: { _all: true } }),
      prisma.notice.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.college.count(),
      prisma.notice.count(),
      // Engine-consistent "not expired": no deadline date already in the past.
      prisma.notice.count({ where: { dates: { none: { kind: "deadline", date: { lt: now } } } } }),
    ]);

    const collegeTypes = Object.fromEntries(collegeTypeRows.map((r) => [r.type, r._count._all]));
    const collegeOwnership = Object.fromEntries(collegeOwnershipRows.map((r) => [r.ownership, r._count._all]));
    const noticeByType = Object.fromEntries(noticeTypeRows.map((r) => [r.type, r._count._all]));

    const [
      totalUsers,
      totalFavorites,
      totalDownloads,
      totalNotifications,
      totalSuggestions,
      totalPushSubscriptions,
      recentUsers,
      pendingSuggestions,
      recentSuggestions,
      recentDownloads,
      suggestionStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.favorite.count(),
      prisma.download.count(),
      prisma.notification.count(),
      prisma.suggestion.count(),
      prisma.pushSubscription.count(),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, email: true, name: true, createdAt: true } }),
      prisma.suggestion.count({ where: { status: "pending" } }),
      prisma.suggestion.findMany({ orderBy: { suggestedAt: "desc" }, take: 10 }),
      prisma.download.findMany({ orderBy: { downloadedAt: "desc" }, take: 10 }),
      prisma.suggestion.groupBy({ by: ["status"], _count: true }),
    ]);

    const notificationByType = await prisma.notification.groupBy({
      by: ["type"],
      _count: true,
    });

    const [readNotifs, unreadNotifs] = await Promise.all([
      prisma.notification.count({ where: { read: true } }),
      prisma.notification.count({ where: { read: false } }),
    ]);

    const topFavorites = await prisma.favorite.groupBy({
      by: ["collegeId"],
      _count: true,
      orderBy: { _count: { collegeId: "desc" } },
      take: 5,
    });

  return NextResponse.json({
    data: {
      colleges: {
        total: collegeTotal,
        byType: collegeTypes,
        byOwnership: collegeOwnership,
      },
      notices: {
        total: noticeTotal,
        active: activeNotices,
        byType: noticeByType,
      },
    },
    db: {
      users: {
        total: totalUsers,
        recent: recentUsers,
      },
      favorites: {
        total: totalFavorites,
        top: topFavorites,
      },
      downloads: {
        total: totalDownloads,
        recent: recentDownloads,
      },
      notifications: {
        total: totalNotifications,
        byType: notificationByType,
        read: readNotifs,
        unread: unreadNotifs,
      },
      suggestions: {
        total: totalSuggestions,
        pending: pendingSuggestions,
        byStatus: suggestionStats,
        recent: recentSuggestions,
      },
      pushSubscriptions: totalPushSubscriptions,
    },
  });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
