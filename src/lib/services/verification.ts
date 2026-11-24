import { prisma } from "@/lib/db/prisma";

export interface CollegeVerification {
  fields: string[];
  lastVerifiedAt: Date | null;
  sources: { name: string; url: string }[];
}

/** Facts about a college that an admin has confirmed against a source. Only confirmed items count. */
export async function getCollegeVerification(collegeId: string): Promise<CollegeVerification> {
  const rows = await prisma.attribution.findMany({
    where: { entityType: "College", entityId: collegeId, fieldPath: { not: null }, verifiedAt: { not: null } },
    include: { source: { select: { name: true, url: true } } },
    orderBy: { verifiedAt: "desc" },
  });
  const sources = new Map<string, { name: string; url: string }>();
  for (const r of rows) if (r.source.url) sources.set(r.source.url, { name: r.source.name, url: r.source.url });
  return {
    fields: [...new Set(rows.map((r) => r.fieldPath as string))],
    lastVerifiedAt: rows[0]?.verifiedAt ?? null,
    sources: [...sources.values()],
  };
}
