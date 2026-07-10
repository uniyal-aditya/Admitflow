import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth";

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password required" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "OTP must be 6 digits" }, { status: 400 });
    }

    const otpHash = hashOtp(otp);
    const record = await prisma.emailOtp.findFirst({
      where: { email, otpHash, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    await prisma.emailOtp.update({ where: { id: record.id }, data: { used: true } });
    await prisma.emailOtp.updateMany({ where: { email, used: false }, data: { used: true } });

    const hashed = await bcrypt.hash(newPassword, 12);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
