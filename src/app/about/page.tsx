import Link from "next/link";
import { Globe, ExternalLink, Linkedin, User, Github } from "lucide-react";
import { PageHeading } from "@/components/gov/PageHeading";

const socials = [
  { label: "Portfolio", href: "https://uaditya.vercel.app", icon: Globe },
  { label: "Dev site", href: "https://adityauniyal.vercel.app", icon: User },
  { label: "Fiverr", href: "https://www.fiverr.com/uniyal_aditya", icon: ExternalLink },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uniyaladitya", icon: Linkedin },
];

const points = [
  { title: "One place for notices", text: "Registration, merit lists, counselling rounds and spot rounds are gathered from many college websites into a single list." },
  { title: "College profiles", text: "Each college has a page with its courses, seats, fees, contact details, admission timeline and an official website link." },
  { title: "Your own watchlist", text: "Follow the colleges you care about and see their updates, deadlines and alerts on your dashboard." },
  { title: "Free for students", text: "AdmitFlow is free to use and has no advertisements." },
];

const card = "rounded-md border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900";
const h2 = "mb-3 inline-block border-b-2 border-saffron-500 pb-1 font-serif text-xl font-bold text-indigo-900 dark:text-white";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        title="About AdmitFlow"
        crumbs={[{ label: "About" }]}
        description="A free guide to college admissions in Uttarakhand, built so that students and parents do not miss a notice or a deadline."
      />

      <div className="space-y-6">
        <section className={card}>
          <h2 className={h2}>Why it exists</h2>
          <p className="max-w-prose leading-relaxed text-gray-800 dark:text-gray-200">
            Every college publishes admission news in its own way: on a home page, in a news section, or as a PDF circular. Students end up checking many websites every day, and spot rounds, vacant seats, extensions and counselling notices are easy to miss. AdmitFlow collects this information in one place and links back to the official source for every item.
          </p>
          <p className="mt-3 max-w-prose leading-relaxed text-gray-800 dark:text-gray-200">
            Information is collected from public sources and can change. Please confirm dates, fees and eligibility on the official college website before applying.
          </p>
        </section>

        <section aria-labelledby="what">
          <h2 id="what" className={h2}>What you can do here</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p.title} className="rounded-md border border-gray-200 border-l-4 border-l-saffron-500 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-serif text-lg font-semibold text-indigo-900 dark:text-white">{p.title}</h3>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{p.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-800 dark:text-gray-200">
            See the full list of institutions on the <Link href="/colleges" className="font-semibold text-indigo-800 underline dark:text-indigo-200">College profiles</Link> page. Is one missing? <Link href="/suggest" className="font-semibold text-indigo-800 underline dark:text-indigo-200">Suggest a college</Link>.
          </p>
        </section>

        <section className={card}>
          <h2 className={h2}>Open source</h2>
          <p className="mb-4 text-gray-800 dark:text-gray-200">The project is open source. You can read the code and report problems on GitHub.</p>
          <a href="https://github.com/uniyal-aditya/Admitflow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-indigo-800 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-800">
            <Github className="h-4 w-4" /> View on GitHub <span className="sr-only">(opens in a new tab)</span>
          </a>
        </section>

        <section className={card}>
          <h2 className={h2}>About the developer</h2>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Aditya Uniyal, India</p>
          <p className="mt-2 max-w-prose text-sm text-gray-800 dark:text-gray-200">
            I design and build scalable digital systems, from production-ready Discord bots to real-time web platforms and interactive applications.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-200 dark:hover:bg-gray-800">
                    <Icon className="h-4 w-4" /> {s.label} <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
