"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

const stagger = {
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:bg-gray-950/80 dark:border-gray-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AdmitFlow" className="h-8 w-8" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">AdmitFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">About</Link>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
              <Moon className="h-5 w-5 absolute inset-0 m-auto rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link href="/login" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">Get Started</Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t px-4 py-3 md:hidden bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <Link href="/about" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">About</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white text-center hover:bg-indigo-700 transition-colors">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex justify-center mb-8">
            <img src="/logo.svg" alt="AdmitFlow" className="h-24 w-24 md:h-32 md:w-32" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="inline-flex items-center gap-2 rounded-full border bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 mb-6">
            Uttarakhand Government College Admissions
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="max-w-4xl mx-auto text-4xl md:text-6xl font-bold tracking-tight">
            Never Miss a{" "}
            <span className="gradient-text">College Admission</span>{" "}
            Opportunity Again
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            AdmitFlow collects, organizes, and displays admission information from all
            Uttarakhand government colleges in one place. Stop visiting 10 websites every day.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
              Learn More <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>

        <motion.section variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="mx-auto max-w-6xl px-4 pb-16">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">No more hopping between college websites. All admission info in one dashboard.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                  }}
                  className="group rounded-2xl border bg-white p-6 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/50 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="mx-auto max-w-6xl px-4 pb-16">
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                className="rounded-2xl border bg-white p-6 text-center dark:bg-gray-900 dark:border-gray-800"
              >
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section variants={fadeUp} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 text-white text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <img src="/logo.svg" alt="" className="mx-auto h-10 w-10 mb-4 opacity-80" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Never Miss a Deadline?</h2>
            <p className="mt-3 max-w-xl mx-auto opacity-80">
              Join thousands of Uttarakhand students who use AdmitFlow to track college admissions.
              Free forever. No ads. No tracking.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-gray-100 transition-colors">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
