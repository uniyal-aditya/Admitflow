import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth";

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "OTP must be 6 digits" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s/g, "");
    const otpHash = hashOtp(otp);

    const record = await prisma.phoneOtp.findFirst({
      where: {
        phone: cleanPhone,
        otpHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    await prisma.phoneOtp.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Mark all other OTPs for this phone as used
    await prisma.phoneOtp.updateMany({
      where: { phone: cleanPhone, used: false },
      data: { used: true },
    });

    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: cleanPhone },
      });
    } else {
      user = await prisma.user.create({
        data: { phone: cleanPhone, name: `User ${cleanPhone.slice(-4)}`, email: `${cleanPhone.replace(/[^0-9]/g, "")}@phone.admitflow.app` },
      });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
