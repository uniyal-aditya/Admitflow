import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.broadcastMessage.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete banner error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
