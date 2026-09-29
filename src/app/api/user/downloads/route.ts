import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const downloads = await prisma.download.findMany({
      where: { userId: session.id },
      orderBy: { downloadedAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ downloads });
  } catch (err) {
    console.error("GET downloads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { noticeId, noticeTitle, collegeName } = await req.json();
    if (!noticeId || !noticeTitle) {
      return NextResponse.json({ error: "noticeId and noticeTitle are required" }, { status: 400 });
    }

    const download = await prisma.download.create({
      data: {
        userId: session.id,
        noticeId: String(noticeId),
        noticeTitle: String(noticeTitle).slice(0, 300),
        collegeName: String(collegeName ?? "").slice(0, 200),
      },
    });
    return NextResponse.json({ download }, { status: 201 });
  } catch (err) {
    console.error("POST downloads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
