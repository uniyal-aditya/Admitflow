import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET() {
  if (!ADMIN_EMAIL) {
    return NextResponse.json({ error: "ADMIN_EMAIL not configured" }, { status: 500 });
  }
  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  return NextResponse.json({ exists: !!user, email: ADMIN_EMAIL });
}

export async function POST(req: NextRequest) {
  if (!ADMIN_EMAIL) {
    return NextResponse.json({ error: "ADMIN_EMAIL not configured" }, { status: 500 });
  }

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const { password } = await req.json();
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email: ADMIN_EMAIL, password: hashed, name: "Admin" },
  });

  await setSessionCookie(user.id);

  return NextResponse.json({ success: true });
}
