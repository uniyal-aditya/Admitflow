import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true, userId: true, title: true, content: true, media: true,
        tags: true, isPinned: true, isLocked: true, status: true,
        moderatedById: true, moderatedAt: true, deleteReason: true,
        createdAt: true, updatedAt: true,
        user: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { comments: true } },
        comments: {
          where: { status: { in: ["approved", "deleted"] } },
          select: {
            id: true, content: true, media: true, isEdited: true,
            status: true, deleteReason: true,
            createdAt: true, updatedAt: true,
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.status !== "approved" && post.userId !== session.id) {
      const admin = await prisma.user.findUnique({ where: { id: session.id } });
      if (admin?.role !== "admin" && admin?.role !== "moderator") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("Get post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const isOwner = post.userId === session.id;

    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    if (isOwner && !isAdmin) {
      const update: any = {};
      if (body.title !== undefined) update.title = body.title?.trim() || null;
      if (body.content !== undefined) {
        if (body.content.length > 50000) return NextResponse.json({ error: "Content too long" }, { status: 400 });
        update.content = body.content.trim();
      }
      if (body.media !== undefined) update.media = body.media;

      const updated = await prisma.post.update({ where: { id }, data: update });
      return NextResponse.json({ post: updated });
    }

    const update: any = {};
    if (body.title !== undefined) update.title = body.title?.trim() || null;
    if (body.content !== undefined) update.content = body.content.trim();
    if (body.media !== undefined) update.media = body.media;
    if (body.tags !== undefined) update.tags = body.tags;
    if (body.isPinned !== undefined) update.isPinned = body.isPinned;
    if (body.isLocked !== undefined) update.isLocked = body.isLocked;
    if (body.status !== undefined) {
      update.status = body.status;
      update.moderatedById = session.id;
      update.moderatedAt = new Date();
      if (body.status === "deleted" && body.deleteReason) {
        update.deleteReason = body.deleteReason;
      }
    }

    const updated = await prisma.post.update({ where: { id }, data: update });

    if (body.status) {
      await prisma.adminLog.create({
        data: {
          action: `post_${body.status}`,
          details: JSON.stringify({ postId: id, postUserId: post.userId, reason: body.deleteReason || null }),
          adminEmail: session.email,
        },
      });
    }

    return NextResponse.json({ post: updated });
  } catch (err) {
    console.error("Update post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const isOwner = post.userId === session.id;

    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (isAdmin) {
      const body = await req.json().catch(() => ({}));
      await prisma.post.update({
        where: { id },
        data: { status: "deleted", moderatedById: session.id, moderatedAt: new Date(), deleteReason: body.deleteReason || null },
      });
      await prisma.adminLog.create({
        data: { action: "post_deleted", details: JSON.stringify({ postId: id, postUserId: post.userId, reason: body.deleteReason || null }), adminEmail: session.email },
      });
    } else {
      await prisma.post.update({ where: { id }, data: { status: "deleted" } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
