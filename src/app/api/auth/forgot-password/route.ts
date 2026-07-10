import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

async function sendEmailOtp(email: string, otp: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost, port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: `"AdmitFlow" <${smtpUser}>`,
      to: email,
      subject: "Reset your AdmitFlow password",
      text: `Your OTP is: ${otp}\n\nThis code expires in 10 minutes.`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4f46e5">Password Reset</h2>
        <p>Your one-time code:</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#4f46e5;padding:16px;text-align:center;background:#f5f3ff;border-radius:8px">${otp}</div>
        <p style="color:#6b7280;font-size:14px">Expires in 10 minutes</p>
      </div>`,
    });
  } else {
    console.log(`--- PASSWORD RESET OTP for ${email}: ${otp} ---`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    const existing = await prisma.emailOtp.findMany({
      where: { email, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }, take: 1,
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: "OTP already sent. Wait before requesting again." }, { status: 429 });
    }

    const otp = generateOtp();
    await prisma.emailOtp.create({
      data: { email, otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    await sendEmailOtp(email, otp);
    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
