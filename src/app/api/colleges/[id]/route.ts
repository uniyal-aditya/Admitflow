import { NextResponse } from "next/server";
import { getCollegeDetail } from "@/lib/services/admission";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const data = await getCollegeDetail(id);
    if (!data) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(`GET /api/colleges/${id} failed:`, e);
    return NextResponse.json({ error: "Failed to load college" }, { status: 500 });
  }
}
