"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Bell, BookOpen, BarChart3,
  CalendarDays, Sparkles, Shield, Lightbulb, ChevronRight,
  Menu, X, Moon, Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: Bell, title: "Unified Notice Center",
    desc: "All college notices in one place. Never miss spot rounds, merit lists, or registration deadlines.",
  },
  {
    icon: CalendarDays, title: "Admission Timeline",
    desc: "Know exactly where each college's admission process stands in real-time.",
  },
  {
    icon: BarChart3, title: "Analytics & Insights",
    desc: "Track admission trends, notice patterns, and important statistics.",
  },
  {
    icon: Sparkles, title: "AI Summaries",
    desc: "Get AI-generated summaries of lengthy PDF notices. No need to read 20-page documents.",
  },
  {
    icon: Shield, title: "Reliable & Free",
    desc: "No ads, no tracking, no hidden costs. Built solely for Uttarakhand students.",
  },
  {
    icon: Lightbulb, title: "Smart Suggestions",
    desc: "Help expand the database by suggesting colleges not yet listed.",
  },
];

const stats = [
  { label: "Colleges Covered", value: "33" },
  { label: "Active Notices", value: "50+" },
  { label: "Notice Types", value: "11" },
  { label: "Free Forever", value: "₹0" },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:bg-gray-950/80 dark:border-gray-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AdmitFlow" width={32} height={32} className="h-8 w-8" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AdmitFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">About</Link>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
              <Moon className="h-5 w-5 absolute inset-0 m-auto rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t px-4 py-3 md:hidden bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <Link href="/about" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">About</Link>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="AdmitFlow" width={96} height={96} className="h-24 w-24" priority />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 mb-6">
            Uttarakhand Government College Admissions
          </div>
          <h1 className="max-w-4xl mx-auto text-4xl md:text-6xl font-bold tracking-tight">
            Never Miss a{" "}
            <span className="gradient-text">College Admission</span>{" "}
            Opportunity Again
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            AdmitFlow collects, organizes, and displays admission information from all
            Uttarakhand government colleges in one place. Stop visiting 10 websites every day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-all">
              Learn More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border bg-white p-6 text-center dark:bg-gray-900 dark:border-gray-800">
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Everything You Need</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Your personal admission assistant for Uttarakhand colleges</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
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

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 text-white text-center">
            <GraduationCap className="mx-auto h-10 w-10 mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Never Miss a Deadline?</h2>
            <p className="mt-3 max-w-xl mx-auto opacity-80">
              Join thousands of Uttarakhand students who use AdmitFlow to track college admissions.
              Free forever. No ads. No tracking.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-gray-100 transition-colors">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400 dark:border-gray-800">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
          <Link href="/tos" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
        </div>
        <p>AdmitFlow v1.0 &mdash; Dedicated to Uttarakhand Students</p>
      </footer>
    </div>
  );
}
