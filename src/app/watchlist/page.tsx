import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { WatchlistClient } from "./WatchlistClient";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const [notices, collegeNames] = await Promise.all([getNotices(), getCollegeShortNames()]);

  return <WatchlistClient notices={notices} collegeNames={collegeNames} />;
}
