import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { colleges } from "@/data/colleges";
import { notices } from "@/data/notices";

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
  const auth = await checkAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const collegeTypes = colleges.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  const collegeOwnership = colleges.reduce<Record<string, number>>((acc, c) => {
    acc[c.ownership] = (acc[c.ownership] || 0) + 1;
    return acc;
  }, {});

  const noticeByType = notices.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  const activeNotices = notices.filter((n) => {
    const now = new Date();
    if (n.lastDate && new Date(n.lastDate) < now) return false;
    return true;
  }).length;

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
        total: colleges.length,
        byType: collegeTypes,
        byOwnership: collegeOwnership,
      },
      notices: {
        total: notices.length,
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
}
