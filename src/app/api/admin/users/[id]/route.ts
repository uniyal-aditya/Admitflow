import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, avatar: true, phone: true,
        role: true, isBanned: true, bannedAt: true, banReason: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
        googleId: true,
        _count: { select: { pushSubscriptions: true, notifications: true, downloads: true, favorites: true, posts: true, comments: true } },
        settings: { select: { emailNotifications: true, deviceNotifications: true, language: true, notificationTypes: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const update: any = {};

    if (body.name !== undefined) update.name = body.name;
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.role !== undefined) {
      if (!["user", "moderator", "admin"].includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      update.role = body.role;
    }

    if (body.ban !== undefined) {
      if (body.ban) {
        update.isBanned = true;
        update.bannedAt = new Date();
        update.banReason = body.banReason || null;
      } else {
        update.isBanned = false;
        update.bannedAt = null;
        update.banReason = null;
      }
    }

    const user = await prisma.user.update({ where: { id }, data: update });

    await prisma.adminLog.create({
      data: {
        action: body.ban !== undefined ? (body.ban ? "ban_user" : "unban_user") : "edit_user",
        details: JSON.stringify({ targetUserId: id, ...body }),
        adminEmail: admin.email,
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
