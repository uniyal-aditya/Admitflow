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
    /\.(png|jpg|jpeg|svg|ico|webp|css|js)$/.test(pathname);

  // Rate limit all API routes (except auth)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const result = rateLimit(ip, 60, 60000);
    if (!result.allowed) {
      return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)) } });
    }
  }

  if (isPublic) {
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
