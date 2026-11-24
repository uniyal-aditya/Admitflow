"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Bell, CalendarDays, Search, MessageCircle, Lightbulb, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { HeroSlider } from "@/components/gov/HeroSlider";
import { SafeImage } from "@/components/gov/SafeImage";
import { quickLinks, siteStats, featuredColleges, howItWorks } from "@/data/site";

const icons = { BookOpen, Bell, CalendarDays, Search, MessageCircle, Lightbulb };

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <HeroSlider />

      {/* Quick links */}
      <section aria-labelledby="quick-links" className="mx-auto max-w-7xl px-4 py-10">
        <h2 id="quick-links" className="mb-5 text-2xl font-bold text-indigo-900 dark:text-white">Quick links</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((q) => {
            const Icon = icons[q.icon];
            return (
              <li key={q.href}>
                <Link href={q.href} className="flex h-full items-center gap-4 rounded-md border border-gray-200 border-l-4 border-l-saffron-500 bg-white p-4 transition-colors hover:bg-indigo-50 dark:border-gray-800 dark:border-l-saffron-500 dark:bg-gray-900 dark:hover:bg-gray-800">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"><Icon className="h-6 w-6" /></span>
                  <span>
                    <span className="block font-semibold text-indigo-900 dark:text-white">{q.label}</span>
                    <span className="block text-sm text-gray-600 dark:text-gray-400">{q.desc}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* About */}
      <section aria-labelledby="about" className="bg-white dark:bg-gray-950">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h2 id="about" className="text-2xl font-bold text-indigo-900 dark:text-white">About AdmitFlow</h2>
            <p className="mt-4 max-w-prose text-gray-700 dark:text-gray-300">
              Admission news for Uttarakhand colleges is spread across many websites, PDFs and notice boards. AdmitFlow gathers it in one place so students and parents can see what is open, what has closed and where to apply.
            </p>
            <p className="mt-3 max-w-prose text-gray-700 dark:text-gray-300">
              Every college page links to the official website. Please confirm dates and fees there before you apply.
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-5 dark:border-gray-800">
              {siteStats.map((s) => (
                <div key={s.label}>
                  <dd className="font-serif text-3xl font-bold text-indigo-800 dark:text-indigo-200">{s.value}</dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <SafeImage
            src="/images/about/about.jpg"
            alt="Students studying together on a campus lawn"
            className="h-72 w-full rounded-md object-cover md:h-80"
          />
        </div>
      </section>

      {/* Featured colleges */}
      <section aria-labelledby="featured" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="featured" className="text-2xl font-bold text-indigo-900 dark:text-white">Featured colleges</h2>
          <Link href="/colleges" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-800 hover:underline dark:text-indigo-200">View all colleges <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredColleges.map((c) => (
            <li key={c.id}>
              <Link href={`/colleges/${c.id}`} className="group block overflow-hidden rounded-md border border-gray-200 bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <SafeImage src={`/images/colleges/${c.id}.jpg`} alt={`${c.name} campus`} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold leading-snug text-indigo-900 group-hover:underline dark:text-white">{c.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><MapPin className="h-3.5 w-3.5" />{c.place}</p>
                  <p className="mt-2 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">{c.kind}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="bg-indigo-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 id="how" className="text-2xl font-bold text-indigo-900 dark:text-white">How to use AdmitFlow</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {howItWorks.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-800 font-serif text-lg font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-indigo-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sign-up band */}
      <section className="bg-indigo-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Create a free account</h2>
            <p className="mt-1 text-white/80">Save colleges to your watchlist and get notified about new notices.</p>
          </div>
          <Link href="/login" className="rounded-md bg-saffron-500 px-6 py-3 text-sm font-semibold text-white hover:bg-saffron-600">Sign in or register</Link>
        </div>
      </section>
    </>
  );
}
