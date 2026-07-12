import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function generateVerifier(): string {
  return base64url(crypto.randomBytes(32));
}

function sha256(verifier: string): string {
  return base64url(crypto.createHash("sha256").update(verifier).digest());
}

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(new URL("/login?error=config", req.url));
    }

    const { searchParams } = new URL(req.url);
    const redirect = searchParams.get("redirect") || "/dashboard";
    const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "admitflowin.vercel.app";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const codeVerifier = generateVerifier();
    const codeChallenge = sha256(codeVerifier);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      state: safeRedirect,
      prompt: "select_account",
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    res.cookies.set("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
