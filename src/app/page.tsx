"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  GraduationCap,
  Search,
  Star,
  BarChart3,
  CalendarDays,
  Sparkles,
  Download,
  Shield,
  Lightbulb,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CollegeLogo } from "@/components/CollegeLogo";
import { colleges } from "@/data/colleges";

const features = [
  {
    icon: Bell,
    title: "Unified Notice Center",
    desc: "All college notices in one place. Never miss spot rounds, merit lists, or registration deadlines.",
  },
  {
    icon: Star,
    title: "Smart Watchlist",
    desc: "Follow your favourite colleges and get priority updates for what matters to you.",
  },
  {
    icon: Search,
    title: "Intelligent Search",
    desc: "Search across all notices, colleges, courses, and branches instantly.",
  },
  {
    icon: CalendarDays,
    title: "Admission Timeline",
    desc: "Know exactly where each college's admission process stands in real-time.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track admission trends, notice patterns, and important statistics.",
  },
  {
    icon: Sparkles,
    title: "AI Summaries",
    desc: "Get AI-generated summaries of lengthy PDF notices. No need to read 20-page documents.",
  },
  {
    icon: Lightbulb,
    title: "Suggest Missing Colleges",
    desc: "Know a college that's not listed? Suggest it and help expand the database for everyone.",
  },
  {
    icon: Shield,
    title: "Open Source & Free",
    desc: "Completely open source. Download, modify, and contribute on GitHub.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="flex flex-col items-center py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 mb-6">
          <GraduationCap className="h-4 w-4" />
          Uttarakhand Government College Admissions
        </div>
        <h1 className="max-w-3xl text-4xl md:text-6xl font-bold tracking-tight">
          Never Miss a{" "}
          <span className="gradient-text">College Admission</span>{" "}
          Opportunity Again
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          AdmitFlow collects, organizes, and displays admission information from all
          Uttarakhand government colleges in one place. Stop visiting 10 websites every day.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-all"
          >
            Learn More
          </Link>
        </div>
        <div className="mt-10 w-full max-w-xl">
          <SearchBar placeholder="Search for colleges, notices, courses..." />
        </div>
      </section>

      <section className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Supported Colleges</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{colleges.length} Uttarakhand colleges — government & private</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {colleges.slice(0, 16).map((c) => (
            <Link
              key={c.id}
              href={`/colleges/${c.id}`}
              className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-indigo-700 transition-all"
            >
              <CollegeLogo collegeId={c.id} name={c.shortName} size="sm" />
              <span className="text-sm font-medium truncate">{c.shortName}</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/colleges"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View all {colleges.length} colleges
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Everything You Need</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">AdmitFlow is your personal admission assistant for Uttarakhand</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-12">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 text-white text-center">
          <Download className="mx-auto h-10 w-10 mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold">Open Source & Free</h2>
          <p className="mt-3 max-w-xl mx-auto opacity-80">
            AdmitFlow is completely open source. Download, modify, and contribute on GitHub.
            The web version is free for everyone.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/AdmitFlow/admitflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-gray-100 transition-colors"
            >
              View on GitHub
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-400 dark:border-gray-800">
        <p>AdmitFlow v1.0 &mdash; Dedicated to Uttarakhand Students</p>
      </footer>
    </div>
  );
}
