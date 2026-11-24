import Link from "next/link";
import { ExternalLink, Globe, Mail, Phone, MapPin, Building2, ChevronRight } from "lucide-react";
import { getCollegeDetail } from "@/lib/services/admission";
import { CollegeLogo } from "@/components/CollegeLogo";
import { SafeImage } from "@/components/gov/SafeImage";
import { getCollegeVerification } from "@/lib/services/verification";
import { FavoriteStar } from "@/components/FavoriteStar";
import { NoticeCard } from "@/components/NoticeCard";
import { Timeline } from "@/components/Timeline";
import { collegeTypeLabel, computeTimeline } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCollegeDetail(id);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Building2 className="h-16 w-16 mb-4" />
        <p className="text-xl font-medium">College not found</p>
        <Link href="/colleges" className="mt-4 text-indigo-600 hover:underline">Back to colleges</Link>
      </div>
    );
  }

  const { college, notices: collegeNotices, timeline: rawTimeline } = detail;
  const timeline = rawTimeline ? computeTimeline(rawTimeline) : undefined;
  const activeNotices = collegeNotices.filter((n) => n.lastDate ? new Date(n.lastDate) >= new Date() : true);

  const verification = await getCollegeVerification(college.id).catch(() => null);
  const fieldLabels: Record<string, string> = { name: "name", website: "website", established: "year established", location: "location", district: "district", contactPhone: "phone", contactEmail: "email", accreditation: "accreditation", affiliation: "affiliation", type: "type", ownership: "ownership" };
  const ownershipLabel =
    college.ownership === "government" ? "Government" : college.ownership === "private" ? "Private" : college.ownership === "deemed" ? "Deemed university" : college.ownership;
  const facts: [string, string][] = [
    ["Established", college.established ? String(college.established) : "Not available"],
    ["Accreditation", college.accreditation ?? "Not available"],
    ["Affiliation", college.affiliation ?? "Not available"],
    ["Type", collegeTypeLabel(college.type, college.ownership)],
    ["Ownership", ownershipLabel],
    ["Location", college.location],
  ];
  const card = "rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900";
  const h2 = "mb-4 border-b-2 border-saffron-500 pb-2 text-xl font-bold text-indigo-900 inline-block dark:text-white";

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600 dark:text-gray-400">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/colleges" className="hover:underline">Colleges</Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-gray-900 dark:text-gray-200">{college.shortName}</span>
      </nav>

      {/* Banner */}
      <header className="relative overflow-hidden rounded-md">
        <SafeImage
          src={(college as { imageUrl?: string | null }).imageUrl || `/images/colleges/${college.id}.jpg`}
          alt={`${college.name} campus`}
          className="h-56 w-full object-cover md:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-white p-1.5"><CollegeLogo collegeId={college.id} name={college.shortName} size="lg" /></div>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl">{college.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/90">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{college.location}</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium">{ownershipLabel}</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium">{collegeTypeLabel(college.type, college.ownership)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {college.website && (
              <a href={college.website} data-tour="official-site" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-saffron-500 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-600">
                <Globe className="h-4 w-4" /> Official website <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <span data-tour="watch-star" className="rounded-md bg-white/90 p-1.5 text-indigo-900"><FavoriteStar id={college.id} /></span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className={h2}>About</h2>
            <p className="max-w-prose leading-relaxed text-gray-700 dark:text-gray-300">{college.description || "A description for this college has not been added yet."}</p>
            <dl className="mt-5 grid gap-x-8 gap-y-3 border-t border-gray-200 pt-4 text-sm sm:grid-cols-2 dark:border-gray-800">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-dashed border-gray-200 pb-2 dark:border-gray-800">
                  <dt className="text-gray-600 dark:text-gray-400">{k}</dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-gray-100">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section data-tour="courses" className={card}>
            <h2 className={h2}>Courses offered</h2>
            {college.courses.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Course details have not been added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead>
                    <tr className="bg-indigo-900 text-white">
                      <th scope="col" className="px-3 py-2 font-semibold">Course</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Duration</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Seats</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Fees per year</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {college.courses.map((c) => (
                      <tr key={c.name} className="border-b border-gray-200 even:bg-indigo-50/50 dark:border-gray-800 dark:even:bg-gray-800/40">
                        <th scope="row" className="px-3 py-2 font-medium text-indigo-900 dark:text-indigo-200">{c.name}</th>
                        <td className="px-3 py-2">{c.duration || "-"}</td>
                        <td className="px-3 py-2">{c.seats > 0 ? c.seats : "-"}</td>
                        <td className="px-3 py-2">{c.fees > 0 ? `₹${c.fees.toLocaleString("en-IN")}` : "-"}</td>
                        <td className="px-3 py-2">{c.eligibility || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">Seats, fees and eligibility come from public sources and can change every year. Confirm them on the official website.</p>
          </section>

          <section className={card}>
            <h2 className={h2}>Notices from {college.shortName}</h2>
            {collegeNotices.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                No notices have been published for this college yet.
                {college.website && <> Check the <a href={college.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-800 underline dark:text-indigo-200">official website</a> for the latest admission information.</>}
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {collegeNotices.slice(0, 6).map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
              </div>
            )}
            {collegeNotices.length > 6 && (
              <Link href={`/notices?college=${college.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-800 hover:underline dark:text-indigo-200">
                View all {collegeNotices.length} notices <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {timeline && (
            <section data-tour="timeline" className={card}>
              <h2 className={h2}>Admission timeline</h2>
              <Timeline data={timeline} />
            </section>
          )}

          <section className={card}>
            <h2 className={h2}>Data check</h2>
            {verification && verification.fields.length > 0 ? (
              <>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Our team checked these details against official sources
                  {verification.lastVerifiedAt && <> on {verification.lastVerifiedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</>}:
                  {" "}{verification.fields.map((f) => fieldLabels[f] ?? f).join(", ")}.
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {verification.sources.slice(0, 4).map((s) => (
                    <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-words text-indigo-800 underline dark:text-indigo-200">{s.name}<span className="sr-only"> (opens in a new tab)</span></a></li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-gray-700 dark:text-gray-300">Anything not listed above has not been checked yet.</p>
              </>
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-200">The details on this page have not been checked by our team yet. Please confirm them on the official website.</p>
            )}
          </section>

          <section className={card}>
            <h2 className={h2}>At a glance</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Notices published</dt><dd className="font-semibold">{collegeNotices.length}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Notices still open</dt><dd className="font-semibold text-gov-green-700 dark:text-green-400">{activeNotices.length}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Courses listed</dt><dd className="font-semibold">{college.courses.length}</dd></div>
            </dl>
          </section>

          {college.contact && (college.contact.phone || college.contact.email) && (
            <section className={card}>
              <h2 className={h2}>Contact</h2>
              <ul className="space-y-3 text-sm">
                {college.contact.phone && (
                  <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-indigo-700 dark:text-indigo-300" /><a href={`tel:${college.contact.phone}`} className="hover:underline">{college.contact.phone}</a></li>
                )}
                {college.contact.email && (
                  <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-indigo-700 dark:text-indigo-300" /><a href={`mailto:${college.contact.email}`} className="break-all hover:underline">{college.contact.email}</a></li>
                )}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
