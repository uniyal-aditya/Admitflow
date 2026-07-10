"use client";

import {
  GraduationCap, Heart, Sparkles,
  Shield, BookOpen, Users, Target, Star,
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

const team = [
  { name: "AdmitFlow Team", role: "Built with ❤️ for students" },
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
              "Doon University",
              "UKTech (VMSBUTU)",
              "GBPIET Pauri",
              "THDC IHET Tehri",
              "GIT Gopeshwar",
              "GIT Uttarkashi",
              "GIT Tanakpur",
              "WIT Dehradun",
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
