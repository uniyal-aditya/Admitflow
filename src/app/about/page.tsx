"use client";

import {
  GraduationCap, Heart, Sparkles,
  Shield, BookOpen, Users, Target, Star,
  Globe, ExternalLink, Linkedin, User, Github,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Never Miss Out",
    desc: "Stop visiting 10+ college websites daily. AdmitFlow brings everything to one place — notices, deadlines, counselling updates, and spot rounds.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    desc: "Get AI-generated summaries of lengthy PDF notices. Know what matters without reading 20-page documents.",
  },
  {
    icon: Shield,
    title: "Zero Cost, Forever",
    desc: "AdmitFlow is completely free for everyone. No ads, no tracking, no hidden costs. Just a tool built for students.",
  },
  {
    icon: Users,
    title: "For Uttarakhand Students",
    desc: "Built specifically for Uttarakhand government college admissions. From Doon University to GIT Uttarkashi — we cover all 8 colleges in v1.",
  },
  {
    icon: Star,
    title: "Smart Watchlists",
    desc: "Mark your favourite colleges and get priority notifications. Only see what matters to you.",
  },
  {
    icon: BookOpen,
    title: "Complete College Profiles",
    desc: "Every college has a dedicated page with courses, fees, eligibility, contact details, admission timeline, and all notices in one place.",
  },
];

const socials = [
  { label: "Portfolio", href: "https://uaditya.vercel.app", icon: Globe },
  { label: "Dev Site", href: "https://adityauniyal.vercel.app", icon: User },
  { label: "Fiverr", href: "https://www.fiverr.com/uniyal_aditya", icon: ExternalLink },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uniyaladitya", icon: Linkedin },
];

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 mb-4">
          <GraduationCap className="h-4 w-4" />
          v1.0.0
        </div>
        <h1 className="text-4xl font-bold">
          About <span className="gradient-text">AdmitFlow</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          The Ultimate Uttarakhand Government College Admission Companion — built to ensure no student misses an admission opportunity.
        </p>
      </section>

      <section className="prose dark:prose-invert max-w-none">
        <div className="rounded-2xl border bg-white p-8 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">The Problem</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Every college in Uttarakhand has its own website. Some upload notices on their home page,
            others in an admission section, news section, or as PDF circulars. Students have to visit
            8-10 websites every day just to check if something has changed. Most students miss spot rounds,
            vacant seats, registration extensions, waiting lists, and counselling notices simply because
            they didn&apos;t check the right website on the right day.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">The Solution</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            AdmitFlow collects, organizes, and displays all admission-related information from every
            Uttarakhand government college in one place. Open one application, see everything. No need to
            search multiple websites. With AI summaries, smart notifications, and a clean interface,
            students always know what&apos;s happening and what they need to do next.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Supported Colleges</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Doon University", "UKTech (VMSBUTU)", "GBPIET Pauri", "THDC IHET Tehri",
              "GIT Gopeshwar", "GIT Uttarkashi", "GIT Tanakpur", "WIT Dehradun",
              "Doon Medical College", "VCSGGMS&RI", "SSJ Medical", "GMC Haridwar",
              "Himalayan Institute", "SGRR Medical", "Gautam Buddha", "GEU Medical",
              "UPES Law", "IMS Unison Law", "Uttaranchal Law", "GEU Law",
              "ICFAI Law", "Kumaun Law", "Govt Girls Degree Haldwani", "PG College Tehri",
              "Degree College Karanprayag", "Degree College Kashipur", "Degree College Kotdwar",
              "Degree College Vikasnagar", "Degree College Bageshwar", "APB PG College",
              "GP Kashipur", "GP Girls Dehradun", "GP Aamwala", "GP Barkot",
              "GP Berinag", "GP Girls Nainital", "GRD Pharmacy", "Himalayan Pharmacy",
              "SGRR Pharmacy", "IMS Dehradun", "Amrapali Management", "Doon Business School",
              "Rishikul AYUSH", "Patanjali Ayurveda", "AIIMS Nursing", "IHM Dehradun",
              "Uttaranchal University", "SBSU", "Amrapali University",
            ].map((name) => (
              <div key={name} className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3 dark:bg-gray-800/50 dark:border-gray-700">
                <GraduationCap className="h-5 w-5 text-indigo-500 shrink-0" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Why AdmitFlow?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>



      <section className="rounded-2xl border bg-white p-8 dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Connect with AdmitFlow</h2>
          <p className="text-sm text-gray-500 mb-4">Star us on GitHub — it helps more students discover the project</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/uniyal-aditya/Admitflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
              <span className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                <Star className="h-3 w-3 fill-current" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-8 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-1">About the Developer</h2>
            <p className="text-sm text-gray-500 mb-3">Aditya Uniyal — India</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              I design and build scalable digital systems — from production-ready Discord bots to real-time web platforms
              and experimental interactive applications. Architecture first, implementation second, always.
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="text-center pb-8">
        <h2 className="text-xl font-bold mb-2">Built for Students</h2>
        <p className="text-gray-500 dark:text-gray-400">
          AdmitFlow v1 is dedicated to Uttarakhand government college admissions.
          Future versions will expand to more colleges and states.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          Built with <Heart className="h-4 w-4 text-red-500 fill-current" /> for Uttarakhand students
        </div>
      </section>
    </div>
  );
}
