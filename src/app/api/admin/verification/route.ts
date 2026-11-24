import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-log";

export const dynamic = "force-dynamic";

/** Fields an admin can vouch for. Must match College columns. */
const VERIFIABLE_FIELDS = [
  "name", "website", "established", "location", "district",
  "contactPhone", "contactEmail", "accreditation", "affiliation", "type", "ownership",
] as const;

function parseHttpsUrl(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" && u.hostname.includes(".") ? u : null;
  } catch { return null; }
}

/** List colleges with how many of their facts are confirmed vs awaiting confirmation. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [colleges, attrs] = await Promise.all([
    prisma.college.findMany({ select: { id: true, name: true, shortName: true, district: true }, orderBy: { name: "asc" } }),
    prisma.attribution.findMany({
      where: { entityType: "College", fieldPath: { not: null } },
      include: { source: { select: { id: true, name: true, url: true, kind: true, verification: true } } },
    }),
  ]);

  const byCollege = new Map<string, typeof attrs>();
  for (const a of attrs) byCollege.set(a.entityId, [...(byCollege.get(a.entityId) ?? []), a]);

  return NextResponse.json({
    fields: VERIFIABLE_FIELDS,
    colleges: colleges.map((c) => {
      const list = byCollege.get(c.id) ?? [];
      return {
        ...c,
        confirmed: list.filter((a) => a.verifiedAt).length,
        pending: list.filter((a) => !a.verifiedAt).length,
        attributions: list.map((a) => ({
          id: a.id, field: a.fieldPath, confirmed: !!a.verifiedAt,
          verifiedBy: a.verifiedByAdmin, verifiedAt: a.verifiedAt, source: a.source,
        })),
      };
    }),
  });
}

/** An admin has opened an official source and confirms one field. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { collegeId, fieldPath, sourceName, note } = body as Record<string, string | undefined>;
  const url = parseHttpsUrl(body.sourceUrl);

  if (!collegeId || !fieldPath || !(VERIFIABLE_FIELDS as readonly string[]).includes(fieldPath)) {
    return NextResponse.json({ error: "Choose a college and a valid field." }, { status: 400 });
  }
  if (!url) return NextResponse.json({ error: "Enter the source address (it must start with https://)." }, { status: 400 });

  const college = await prisma.college.findUnique({ where: { id: collegeId }, select: { id: true } });
  if (!college) return NextResponse.json({ error: "College not found." }, { status: 404 });

  const name = (sourceName?.trim() || url.hostname).slice(0, 200);
  const now = new Date();
  let source = await prisma.source.findFirst({ where: { url: url.toString() } });
  source = source
    ? await prisma.source.update({ where: { id: source.id }, data: { verification: "verified", lastCheckedAt: now } })
    : await prisma.source.create({ data: { name, url: url.toString(), kind: "official", verification: "verified", lastCheckedAt: now, notes: note?.slice(0, 500) } });

  const id = `College:${collegeId}:${fieldPath}:${source.id}`;
  const attribution = await prisma.attribution.upsert({
    where: { id },
    update: { verifiedByAdmin: admin.email, verifiedAt: now },
    create: { id, sourceId: source.id, entityType: "College", entityId: collegeId, fieldPath, verifiedByAdmin: admin.email, verifiedAt: now },
  });

  await logAdminAction("verify_fact", `Confirmed ${collegeId}.${fieldPath} against ${url.toString()}`, admin.email);
  return NextResponse.json(attribution);
}

/** Confirm a researched (pending) fact, or take a confirmation back. */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attributionId, action } = await req.json().catch(() => ({})) as { attributionId?: string; action?: string };
  if (!attributionId || (action !== "confirm" && action !== "revoke")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const existing = await prisma.attribution.findUnique({ where: { id: attributionId } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const now = new Date();
  if (action === "confirm") {
    await prisma.attribution.update({ where: { id: attributionId }, data: { verifiedByAdmin: admin.email, verifiedAt: now } });
    await prisma.source.update({ where: { id: existing.sourceId }, data: { verification: "verified", lastCheckedAt: now } });
  } else {
    await prisma.attribution.update({ where: { id: attributionId }, data: { verifiedByAdmin: null, verifiedAt: null } });
  }
  await logAdminAction(action === "confirm" ? "verify_fact" : "revoke_fact", `${action} ${existing.entityId}.${existing.fieldPath}`, admin.email);
  return NextResponse.json({ ok: true });
}
