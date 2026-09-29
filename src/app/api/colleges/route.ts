import { NextResponse } from "next/server";
import { getColleges } from "@/lib/services/admission";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getColleges();
    return NextResponse.json({ colleges: data });
  } catch (e) {
    console.error("GET /api/colleges failed:", e);
    return NextResponse.json({ error: "Failed to load colleges" }, { status: 500 });
  }
}
