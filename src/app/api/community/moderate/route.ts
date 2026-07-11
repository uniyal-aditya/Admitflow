import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (user?.role !== "admin" && user?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "posts";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

    if (type === "posts") {
      const [items, total] = await Promise.all([
        prisma.post.findMany({
          where: { status: "pending" },
          select: {
            id: true, title: true, content: true, status: true, createdAt: true,
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.post.count({ where: { status: "pending" } }),
      ]);
      return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where: { status: "pending" },
        select: {
          id: true, content: true, status: true, createdAt: true,
          postId: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where: { status: "pending" } }),
    ]);
    return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Moderation list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (user?.role !== "admin" && user?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { type, id, action } = body; // type: "post" | "comment", action: "approved" | "rejected"

    if (!type || !id || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (type === "post") {
      await prisma.post.update({
        where: { id },
        data: { status: action, moderatedById: session.id, moderatedAt: new Date() },
      });
    } else {
      await prisma.comment.update({
        where: { id },
        data: { status: action, moderatedById: session.id, moderatedAt: new Date() },
      });
    }

    await prisma.adminLog.create({
      data: {
        action: `${type}_${action}`,
        details: JSON.stringify({ id }),
        adminEmail: session.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Moderate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
