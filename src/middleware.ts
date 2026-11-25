import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/privacy" ||
    pathname === "/tos" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    // Static files must never be redirected to the login page, otherwise images,
    // the app manifest and the service worker break for signed-out visitors.
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/logos/") ||
    pathname.startsWith("/icons/") ||
    /\.(png|jpe?g|gif|svg|ico|webp|avif|css|js|map|woff2?|json|txt)$/i.test(pathname);

  // Rate limit all API routes (except auth)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const result = rateLimit(ip, 60, 60000);
    if (!result.allowed) {
      return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)) } });
    }
  }

  if (isPublic || pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
