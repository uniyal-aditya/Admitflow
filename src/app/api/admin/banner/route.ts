import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const banners = await prisma.broadcastMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(banners);
  } catch (err) {
    console.error("Get banners error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    await prisma.broadcastMessage.updateMany({ where: { active: true }, data: { active: false } });

    const banner = await prisma.broadcastMessage.create({
      data: { message: message.trim() },
    });

    return NextResponse.json(banner);
  } catch (err) {
    console.error("Create banner error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.broadcastMessage.updateMany({ where: { active: true }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete banner error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
