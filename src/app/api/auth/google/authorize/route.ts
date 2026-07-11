import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/login?error=config", req.url));
    }

    const { searchParams } = new URL(req.url);
    const redirect = searchParams.get("redirect") || "/dashboard";
    const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const client = new OAuth2Client(clientId, clientSecret, redirectUri);

    const authUrl = client.generateAuthUrl({
      access_type: "online",
      scope: ["profile", "email"],
      state: safeRedirect,
      prompt: "select_account",
    });

    return NextResponse.redirect(authUrl);
  } catch {
    return NextResponse.redirect(new URL("/login?error=config", req.url));
  }
}
