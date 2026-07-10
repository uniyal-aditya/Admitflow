import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.role !== "superadmin") return NextResponse.json({ error: "Forbidden: only superadmin can delete admins" }, { status: 403 });

    const { id } = await params;
    const target = await prisma.admin.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (target.email === admin.email) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ message: "Admin removed" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
