"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

const collegeTypes = ["university", "engineering", "polytechnic", "degree", "diploma", "medical", "management", "pharmacy", "law", "other"]
const ownershipTypes = ["government", "private", "aided", "deemed", "autonomous"]

interface Course {
  name: string
  duration: string
  seats: number
  fees: number
  eligibility: string
  branches: string
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function NewCollegePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [name, setName] = useState("")

  const [form, setForm] = useState({
    shortName: "",
    type: "engineering",
    ownership: "private",
    location: "",
    district: "",
    website: "",
    admissionPortal: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
    established: 0,
    accreditation: "",
    affiliation: "",
    principal: "",
  })

  const [courses, setCourses] = useState<Course[]>([])

  function setField(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addCourse() {
    setCourses((prev) => [
      ...prev,
      { name: "", duration: "", seats: 0, fees: 0, eligibility: "", branches: "" },
    ])
  }

  function removeCourse(index: number) {
    setCourses((prev) => prev.filter((_, i) => i !== index))
  }

  function setCourse(index: number, key: keyof Course, value: string | number) {
    setCourses((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const processedCourses = courses.map((c) => ({
      ...c,
      seats: Number(c.seats),
      fees: Number(c.fees),
      branches: c.branches
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
    }))

    try {
      const res = await fetch("/api/admin/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slugify(name), name, ...form, courses: processedCourses, established: Number(form.established) }),
      })

      if (res.status === 401) {
        router.push("/")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create college")
      }

      setMessage({ type: "success", text: "College created successfully" })
      setTimeout(() => router.push("/admin/colleges"), 1000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create college" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/colleges" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">Add College</h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">College Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Indian Institute of Technology"
            />
            {name && (
              <p className="text-xs text-gray-500 mt-1">ID: {slugify(name)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Short Name</label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => setField("shortName", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {collegeTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ownership *</label>
              <select
                value={form.ownership}
                onChange={(e) => setField("ownership", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ownershipTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Established</label>
              <input
                type="number"
                value={form.established || ""}
                onChange={(e) => setField("established", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setField("district", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Contact & Links</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admission Portal</label>
              <input
                type="url"
                value={form.admissionPortal}
                onChange={(e) => setField("admissionPortal", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Accreditation</label>
              <input
                type="text"
                value={form.accreditation}
                onChange={(e) => setField("accreditation", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Affiliation</label>
              <input
                type="text"
                value={form.affiliation}
                onChange={(e) => setField("affiliation", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Principal</label>
            <input
              type="text"
              value={form.principal}
              onChange={(e) => setField("principal", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Courses</h2>
            <button
              type="button"
              onClick={addCourse}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus size={14} />
              Add Course
            </button>
          </div>

          {courses.length === 0 && (
            <p className="text-sm text-gray-500">No courses added yet.</p>
          )}

          {courses.map((course, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeCourse(i)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={course.name}
                    onChange={(e) => setCourse(i, "name", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={course.duration}
                    onChange={(e) => setCourse(i, "duration", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 4 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Seats</label>
                  <input
                    type="number"
                    value={course.seats || ""}
                    onChange={(e) => setCourse(i, "seats", Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Fees (₹)</label>
                  <input
                    type="number"
                    value={course.fees || ""}
                    onChange={(e) => setCourse(i, "fees", Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Eligibility</label>
                <input
                  type="text"
                  value={course.eligibility}
                  onChange={(e) => setCourse(i, "eligibility", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Branches (comma-separated)</label>
                <input
                  type="text"
                  value={course.branches}
                  onChange={(e) => setCourse(i, "branches", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. CSE, ECE, ME"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Create College
          </button>
          <Link
            href="/admin/colleges"
            className="px-5 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
