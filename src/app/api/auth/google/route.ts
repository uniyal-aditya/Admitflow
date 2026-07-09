import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, name, googleId } = await req.json();

    if (!email || !googleId) {
      return NextResponse.json({ error: "Email and Google ID required" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: { email, name: name || email.split("@")[0], googleId },
      });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
