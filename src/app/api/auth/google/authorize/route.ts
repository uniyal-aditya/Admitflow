import { NextRequest, NextResponse } from "next/server";

/**
 * This route redirects to Google's OAuth consent screen.
 * It requires the redirect URI to be registered in Google Cloud Console:
 *   Authorized redirect URIs -> https://admitflowin.vercel.app/api/auth/google/callback
 */
export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(new URL("/login?error=config", req.url));
    }

    const { searchParams } = new URL(req.url);
    const redirect = searchParams.get("redirect") || "/dashboard";
    const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";

    // Use the original request host (Vercel sets x-forwarded-host to the custom domain)
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "admitflowin.vercel.app";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      state: safeRedirect,
      prompt: "select_account",
    });

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch {
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
