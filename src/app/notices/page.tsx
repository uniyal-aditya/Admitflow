import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { NoticesBrowser } from "./NoticesBrowser";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ college?: string }>;
}) {
  const sp = await searchParams;
  const [notices, collegeNames, collegeRows] = await Promise.all([
    getNotices(),
    getCollegeShortNames(),
    prisma.college.findMany({ select: { id: true, shortName: true }, orderBy: { shortName: "asc" } }),
  ]);

  // The college page links here as /notices?college=<id>; honour it when the id is real.
  const initialCollege = collegeRows.some((c) => c.id === sp.college) ? sp.college! : "all";

  return (
    <NoticesBrowser
      notices={notices}
      collegeNames={collegeNames}
      colleges={collegeRows}
      initialCollege={initialCollege}
    />
  );
}
