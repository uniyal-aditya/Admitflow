import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

interface Issue { id: string; title: string; college: string; problem: string }

/** Finds notices with problems a visitor would notice. Read-only. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notices = await prisma.notice.findMany({
    include: { dates: { select: { kind: true, date: true } }, college: { select: { shortName: true } } },
    orderBy: { publishedAt: "desc" },
  });

  const issues: Issue[] = [];
  const seen = new Map<string, string>();
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  let published = 0, drafts = 0, archived = 0;

  for (const n of notices) {
    if (n.status === "draft") drafts++;
    else if (n.status === "archived") archived++;
    else published++;

    const base = { id: n.id, title: n.title, college: n.college?.shortName ?? "None" };
    if (n.status === "published") {
      if (!n.officialUrl && !n.pdfUrl) issues.push({ ...base, problem: "No official link or PDF, so visitors cannot check it." });
      if (!n.collegeId) issues.push({ ...base, problem: "Not linked to a college, so it never appears on a college page." });
      if (!n.summary) issues.push({ ...base, problem: "No summary." });

      const deadlines = n.dates.filter((d) => d.kind === "deadline").map((d) => d.date.getTime());
      const last = deadlines.length ? Math.max(...deadlines) : null;
      if (last !== null && n.publishedAt && last < n.publishedAt.getTime() - dayMs) {
        issues.push({ ...base, problem: "The last date is earlier than the published date." });
      }
      if (last !== null && now - last > 60 * dayMs) {
        issues.push({ ...base, problem: "The last date passed more than 60 days ago. Consider archiving it." });
      }
    }
    const key = `${n.collegeId}|${n.title.trim().toLowerCase()}`;
    const first = seen.get(key);
    if (first) issues.push({ ...base, problem: `Same college and title as another notice (${first}).` });
    else seen.set(key, n.id);
  }

  return NextResponse.json({ counts: { total: notices.length, published, drafts, archived, issues: issues.length }, issues });
}
