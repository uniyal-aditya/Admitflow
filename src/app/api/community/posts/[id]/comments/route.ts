import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: id, status: "approved" },
      select: {
        id: true, content: true, media: true, isEdited: true,
        createdAt: true, updatedAt: true,
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (err) {
    console.error("List comments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user?.isBanned) return NextResponse.json({ error: "You are banned from commenting" }, { status: 403 });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.status !== "approved") return NextResponse.json({ error: "Cannot comment on this post" }, { status: 400 });
    if (post.isLocked) return NextResponse.json({ error: "Comments are locked on this post" }, { status: 400 });

    const body = await req.json();
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (body.content.length > 10000) {
      return NextResponse.json({ error: "Comment too long (max 10000 chars)" }, { status: 400 });
    }

    const autoApprove = user?.role === "admin" || user?.role === "moderator";

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        userId: session.id,
        content: body.content.trim(),
        media: body.media || undefined,
        status: autoApprove ? "approved" : "pending",
      },
      select: {
        id: true, content: true, media: true, isEdited: true,
        createdAt: true, updatedAt: true,
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
