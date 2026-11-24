import Link from "next/link";
import { SITE_DISCLAIMER } from "@/data/site";

const cols = [
  { title: "Explore", links: [["Colleges", "/colleges"], ["Notices", "/notices"], ["Admission calendar", "/calendar"], ["Search", "/search"]] },
  { title: "Students", links: [["Community", "/community"], ["Suggest a college", "/suggest"], ["Watchlist", "/watchlist"], ["Settings", "/settings"]] },
  { title: "About", links: [["About AdmitFlow", "/about"], ["Privacy policy", "/privacy"], ["Terms of service", "/tos"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-indigo-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-serif text-xl font-bold">AdmitFlow</p>
          <p className="mt-2 max-w-xs text-sm text-white/75">
            One place to find admission notices, timelines and course details for colleges across Uttarakhand.
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-3 font-serif text-base font-semibold text-saffron-400">{c.title}</h2>
            <ul className="space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-white/80 hover:text-white hover:underline">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs leading-relaxed text-white/65">{SITE_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
