import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, details } = await req.json();
  const log = await prisma.adminLog.create({
    data: {
      action: action || "unknown",
      details: details || null,
      adminEmail: admin.email,
    },
  });

  return NextResponse.json(log);
}

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (admin.role !== "superadmin") {
    return NextResponse.json({ error: "Only superadmin can clear logs" }, { status: 403 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.adminLog.deleteMany({ where: { createdAt: { lt: thirtyDaysAgo } } });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
