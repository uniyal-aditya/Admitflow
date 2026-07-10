import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Valid phone number required (e.g. +919876543210)" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    const existing = await prisma.phoneOtp.findMany({
      where: { phone: cleanPhone, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (existing.length > 0) {
      return NextResponse.json({ error: "OTP already sent. Wait 2 minutes before requesting again." }, { status: 429 });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await prisma.phoneOtp.create({
      data: {
        phone: cleanPhone,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: Replace with real SMS provider (Twilio / MSG91 / etc.)
    // For now, log to console for development
    console.log(`--- OTP for ${cleanPhone}: ${otp} ---`);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
