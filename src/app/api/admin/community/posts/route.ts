import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const status = url.searchParams.get("status") || "";
    const search = url.searchParams.get("search") || "";

    const where: any = {};
    if (status && ["pending", "approved", "rejected", "deleted"].includes(status)) where.status = status;
    if (search) where.OR = [
      { content: { contains: search, mode: "insensitive" as const } },
      { title: { contains: search, mode: "insensitive" as const } },
      { user: { name: { contains: search, mode: "insensitive" as const } } },
      { user: { email: { contains: search, mode: "insensitive" as const } } },
    ];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true, userId: true, title: true, content: true, media: true,
          tags: true, isPinned: true, isLocked: true, status: true,
          moderatedById: true, moderatedAt: true, createdAt: true, updatedAt: true,
          user: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { comments: true } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const pendingCount = await prisma.post.count({ where: { status: "pending" } });
    const commentPendingCount = await prisma.comment.count({ where: { status: "pending" } });

    return NextResponse.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit), pendingCount, commentPendingCount });
  } catch (err) {
    console.error("Admin list posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
