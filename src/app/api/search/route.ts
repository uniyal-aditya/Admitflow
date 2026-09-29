import { NextResponse } from "next/server";
import {
  searchColleges,
  countColleges,
  searchNotices,
  countNotices,
  type CollegeFilters,
  type NoticeFilters,
} from "@/lib/services/search";
import type { CollegeType, Ownership } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limitParam = Number(url.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 100;

  const collegeFilters: CollegeFilters = {
    q,
    type: (url.searchParams.get("type") as CollegeType) || undefined,
    ownership: (url.searchParams.get("ownership") as Ownership) || undefined,
    district: url.searchParams.get("district") || undefined,
    course: url.searchParams.get("course") || undefined,
  };
  const noticeFilters: NoticeFilters = {
    q,
    type: url.searchParams.get("noticeType") || undefined,
    collegeId: url.searchParams.get("college") || undefined,
  };

  try {
    const [colleges, collegeCount, notices, noticeCount] = await Promise.all([
      searchColleges({ ...collegeFilters, limit }),
      countColleges(collegeFilters),
      searchNotices({ ...noticeFilters, limit }),
      countNotices(noticeFilters),
    ]);
    return NextResponse.json({
      query: q,
      colleges: { results: colleges, count: collegeCount },
      notices: { results: notices, count: noticeCount },
    });
  } catch (e) {
    console.error("GET /api/search failed:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
