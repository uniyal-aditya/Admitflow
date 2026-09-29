import { searchColleges, searchNotices } from "@/lib/services/search";
import { SearchBrowser } from "./SearchBrowser";
import type { CollegeType, Ownership } from "@/types";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; ownership?: string; district?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const filters = {
    q,
    type: (sp.type as CollegeType) || undefined,
    ownership: (sp.ownership as Ownership) || undefined,
    district: sp.district || undefined,
  };
  const [colleges, notices] = await Promise.all([
    searchColleges(filters),
    searchNotices({ q }),
  ]);
  return <SearchBrowser initialQuery={q} colleges={colleges} notices={notices} />;
}
