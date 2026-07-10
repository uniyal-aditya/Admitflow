import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admins = await prisma.admin.findMany({
      select: { id: true, email: true, role: true, addedBy: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.role !== "superadmin") return NextResponse.json({ error: "Forbidden: only superadmin can add admins" }, { status: 403 });

    const body = await req.json();
    const { email, role } = body;

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) return NextResponse.json({ error: "User is already an admin" }, { status: 409 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "No user found with this email" }, { status: 404 });

    const newAdmin = await prisma.admin.create({
      data: { email, role: role || "admin", addedBy: admin.email },
    });
    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
