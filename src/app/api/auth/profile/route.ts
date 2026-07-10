import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { name: name.trim() },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
