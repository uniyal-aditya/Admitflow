import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";
import { createAdmin2faToken, ADMIN_2FA_COOKIE } from "@/lib/admin-2fa";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";

const totp = new TOTP({ crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin() });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email: session.email } });
    if (!admin?.totpSecret) {
      return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
    }

    const result = await totp.verify(token, { secret: admin.totpSecret });
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_2FA_COOKIE, await createAdmin2faToken(session.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
