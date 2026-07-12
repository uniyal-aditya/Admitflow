import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const [user, settings, favorites, downloads, notifications, reviews, posts, comments, suggestions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true, referralSource: true, onboardingCompleted: true },
      }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.favorite.findMany({ where: { userId } }),
      prisma.download.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.review.findMany({ where: { userId } }),
      prisma.post.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.comment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.suggestion.findMany({ where: { userId }, orderBy: { suggestedAt: "desc" } }),
    ]);

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      user,
      settings,
      favorites: favorites.map((f) => ({ collegeId: f.collegeId, createdAt: f.createdAt })),
      downloads: downloads.map((d) => ({ noticeTitle: d.noticeTitle, collegeName: d.collegeName, downloadedAt: d.downloadedAt })),
      notifications: notifications.map((n) => ({ type: n.type, title: n.title, read: n.read, createdAt: n.createdAt })),
      reviews,
      posts: posts.map((p) => ({ title: p.title, content: p.content, status: p.status, createdAt: p.createdAt })),
      comments: comments.map((c) => ({ content: c.content, status: c.status, createdAt: c.createdAt })),
      suggestions: suggestions.map((s) => ({ name: s.name, type: s.type, status: s.status, createdAt: s.suggestedAt })),
    });
  } catch (err: any) {
    console.error("Data export error:", err);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
