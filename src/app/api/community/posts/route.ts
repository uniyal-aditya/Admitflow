import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const tag = url.searchParams.get("tag") || "";

    const where: any = { status: "approved" };
    if (tag) where.tags = { has: tag };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true, title: true, content: true, media: true, tags: true,
          isPinned: true, isLocked: true, createdAt: true, updatedAt: true,
          userId: true,
          user: { select: { id: true, name: true, avatar: true, role: true } },
          _count: { select: { comments: true } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("List posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user?.isBanned) return NextResponse.json({ error: "You are banned from posting" }, { status: 403 });

    const body = await req.json();
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (body.content.length > 50000) {
      return NextResponse.json({ error: "Content too long (max 50000 chars)" }, { status: 400 });
    }

    const autoApprove = user?.role === "admin" || user?.role === "moderator";

    const post = await prisma.post.create({
      data: {
        userId: session.id,
        title: body.title?.trim() || null,
        content: body.content.trim(),
        media: body.media || undefined,
        tags: body.tags || [],
        status: autoApprove ? "approved" : "pending",
      },
      select: {
        id: true, title: true, content: true, media: true, tags: true,
        isPinned: true, isLocked: true, status: true, createdAt: true,
        userId: true,
        user: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
