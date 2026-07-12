import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";

const totp = new TOTP({ crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin() });

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = totp.generateSecret();
  const uri = totp.toURI({ issuer: "AdmitFlow", label: admin.email, secret });

  return NextResponse.json({ secret, uri });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { secret, token } = await req.json();
    if (!secret || !token) {
      return NextResponse.json({ error: "Secret and token are required" }, { status: 400 });
    }

    const result = await totp.verify(token, { secret });
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid code. Try again." }, { status: 400 });
    }

    await prisma.admin.update({
      where: { email: admin.email },
      data: { totpSecret: secret },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 });
  }
}
