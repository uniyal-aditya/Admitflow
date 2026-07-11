import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state") || "/dashboard";
    const safeRedirect = state.startsWith("/") && !state.startsWith("//") ? state : "/dashboard";

    if (error) {
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

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.id_token) {
      return NextResponse.redirect(new URL("/login?error=no_token", req.url));
    }

    // Use the same client to verify (it handles the certs caching)
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const avatar = payload.picture || null;

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

    await setSessionCookie(user.id);

    return NextResponse.redirect(new URL(safeRedirect, req.url));
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
