import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("GET notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.id, read: false },
        data: { read: true },
      });
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.id },
        data: { read: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
