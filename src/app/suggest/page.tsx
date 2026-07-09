"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb, Plus, Check, X, ArrowLeft, MapPin, Globe,
  Building2, ExternalLink, Clock, Send,
} from "lucide-react";
import { colleges, collegeCategories } from "@/data/colleges";
import { addSuggestedCollege, getSuggestedColleges } from "@/lib/store";
import { CollegeType } from "@/types";

const types: { value: CollegeType | ""; label: string }[] = [
  { value: "", label: "Select type" },
  { value: "university", label: "University" },
  { value: "engineering", label: "Engineering College" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "degree", label: "Degree College" },
  { value: "medical", label: "Medical College" },
  { value: "management", label: "Management Institute" },
  { value: "pharmacy", label: "Pharmacy College" },
  { value: "law", label: "Law College" },
  { value: "other", label: "Other" },
];

const districts = [
  "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun",
  "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh",
  "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi",
];

export default function SuggestPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [suggested] = useState(() => getSuggestedColleges());
  const [form, setForm] = useState({
    name: "",
    type: "" as CollegeType | "",
    location: "",
    district: "",
    website: "",
  });

  const isDuplicate = colleges.some(
    (c) => c.name.toLowerCase() === form.name.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.location || !form.district) return;
    if (isDuplicate) return;

    addSuggestedCollege({
      name: form.name,
      type: form.type as CollegeType,
      location: form.location,
      district: form.district,
      website: form.website || "#",
    });

    setForm({ name: "", type: "", location: "", district: "", website: "" });
    setShowForm(false);
  };

  const existingNames = colleges.map((c) => c.name);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Suggest a College
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Help expand AdmitFlow by suggesting a college that&apos;s not yet listed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Suggest College"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 space-y-4">
          <h2 className="font-semibold">College Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                College Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Government College, Rudrapur"
                className="w-full rounded-lg border bg-white/50 px-3 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                required
              />
              {form.name && isDuplicate && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  This college is already in the database
                </p>
              )}
              {form.name && !isDuplicate && form.name.length > 3 && (
                <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  New college — not in database yet
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                College Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CollegeType })}
                className="w-full rounded-lg border bg-white/50 px-3 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                required
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                District *
              </label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-lg border bg-white/50 px-3 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                required
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location (City/Town) *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Rudrapur"
                className="w-full rounded-lg border bg-white/50 px-3 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://collegewebsite.ac.in"
                className="w-full rounded-lg border bg-white/50 px-3 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!form.name || !form.type || !form.district || !form.location || isDuplicate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
            Submit Suggestion
          </button>
        </form>
      )}

      <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h2 className="font-semibold mb-3">Currently Listed Colleges</h2>
        <p className="text-sm text-gray-500 mb-4">
          {colleges.length} colleges are already in AdmitFlow. Check if yours is listed below before suggesting.
        </p>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {colleges.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{c.name}</span>
              </div>
              <span className="shrink-0 text-xs text-gray-400 ml-2">{c.district}</span>
            </div>
          ))}
        </div>
      </div>

      {suggested.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="font-semibold mb-3">Your Suggestions ({suggested.length})</h2>
          <div className="space-y-2">
            {suggested.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3 dark:bg-gray-800/50 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.location}, {s.district}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      : s.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  }`}>
                    {s.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(s.suggestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
