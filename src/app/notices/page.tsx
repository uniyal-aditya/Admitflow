import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { NoticesBrowser } from "./NoticesBrowser";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const [notices, collegeNames, collegeRows] = await Promise.all([
    getNotices(),
    getCollegeShortNames(),
    prisma.college.findMany({ select: { id: true, shortName: true }, orderBy: { shortName: "asc" } }),
  ]);

  return (
    <NoticesBrowser
      notices={notices}
      collegeNames={collegeNames}
      colleges={collegeRows}
    />
  );
}
