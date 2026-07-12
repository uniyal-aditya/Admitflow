import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state") || "/dashboard";
    const safeRedirect = state.startsWith("/") && !state.startsWith("//") ? state : "/dashboard";

    if (error === "access_denied") {
      return NextResponse.redirect(new URL(`/login?error=denied`, req.url));
    }
    if (!code) {
      return NextResponse.redirect(new URL(`/login?error=auth_failed`, req.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/login?error=config", req.url));
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "admitflowin.vercel.app";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const codeVerifier = req.cookies.get("code_verifier")?.value;

    const bodyParams: Record<string, string> = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    if (codeVerifier) {
      bodyParams.code_verifier = codeVerifier;
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(bodyParams),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return NextResponse.redirect(new URL("/login?error=server", req.url));
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
    }

    const info = await userRes.json();
    const googleId = info.id;
    const email = info.email;
    const name = info.name || email?.split("@")[0] || "User";
    const avatar = info.picture || null;

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
    }

    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true, avatar: true, googleId: true, onboardingCompleted: true } });

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      const updates: Record<string, any> = { lastLoginAt: new Date() };
      if (!existingUser.googleId && googleId) updates.googleId = googleId;
      if (!existingUser.avatar && avatar) updates.avatar = avatar;
      await prisma.user.update({ where: { id: existingUser.id }, data: updates });
      userId = existingUser.id;
    } else {
      isNewUser = true;
      const newUser = await prisma.user.create({
        data: { email, name, googleId, avatar, lastLoginAt: new Date() },
      });
      userId = newUser.id;
    }

    await setSessionCookie(userId);

    await logAdminAction(isNewUser ? "user_registered" : "user_login", `${name || email} signed in`, email);

    const res = NextResponse.redirect(new URL(isNewUser ? "/onboarding" : safeRedirect, req.url));
    res.cookies.delete("code_verifier");
    return res;
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
