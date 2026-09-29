import { getColleges, getDistricts } from "@/lib/services/admission";
import { CollegesBrowser } from "./CollegesBrowser";

export const dynamic = "force-dynamic";

export default async function CollegesPage() {
  const [colleges, districts] = await Promise.all([getColleges(), getDistricts()]);
  return <CollegesBrowser colleges={colleges} districts={districts} />;
}
