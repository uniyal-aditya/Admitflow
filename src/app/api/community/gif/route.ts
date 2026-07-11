import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const KLIPY_BASE = "https://api.klipy.com/api/v1";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = url.searchParams.get("page") || "1";

  const apiKey = process.env.KLIPY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "KLIPY_API_KEY not configured. Get one free at https://partner.klipy.com" }, { status: 500 });

  try {
    const endpoint = q
      ? `${KLIPY_BASE}/${apiKey}/gifs/search?q=${encodeURIComponent(q)}&per_page=12&page=${page}`
      : `${KLIPY_BASE}/${apiKey}/gifs/trending?per_page=12&page=${page}`;

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Klipy API error: ${res.status}`);
    const data = await res.json();

    const results = (data.results || []).map((r: any) => ({
      id: r.id || r.slug,
      title: r.title || "",
      url: r.media_formats?.gif?.url || r.url || "",
      preview: r.media_formats?.tinygif?.url || r.media_formats?.gif?.url || r.preview || "",
      width: r.media_formats?.gif?.dims?.[0] || 200,
      height: r.media_formats?.gif?.dims?.[1] || 200,
    }));

    return NextResponse.json({ results, next: String(Number(page) + 1) });
  } catch (err) {
    console.error("Klipy search error:", err);
    return NextResponse.json({ error: "Failed to search GIFs" }, { status: 500 });
  }
}
