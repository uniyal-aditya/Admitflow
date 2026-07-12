import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/db/prisma";
import { createToken, COOKIE_NAME } from "@/lib/auth";

async function upsertUser(googleId: string, email: string, name: string, avatar: string | null) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const updates: Record<string, any> = {};
    if (!user.googleId) updates.googleId = googleId;
    if (avatar && user.avatar !== avatar) updates.avatar = avatar;
    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
    }
  } else {
    user = await prisma.user.create({
      data: { email, name, googleId, avatar },
    });
  }

  return user;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, accessToken } = body;

    if (!credential && !accessToken) {
      return NextResponse.json({ error: "Credential or access token required" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
    }

    let googleId: string;
    let email: string;
    let name: string;
    let avatar: string | null;

    if (credential) {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
      }

      googleId = payload.sub;
      email = payload.email;
      name = payload.name || email.split("@")[0];
      avatar = payload.picture || null;
    } else {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
      }
      const info = await res.json();
      googleId = info.id;
      email = info.email;
      name = info.name || email.split("@")[0];
      avatar = info.picture || null;
    }

    const user = await upsertUser(googleId, email, name, avatar);
    const token = await createToken(user.id);

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
