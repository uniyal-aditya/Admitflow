"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const collegeTypes = ["university", "engineering", "polytechnic", "degree", "diploma", "medical", "management", "pharmacy", "law", "other"]
const ownershipTypes = ["government", "private", "aided", "deemed", "autonomous"]

export default function EditCollegePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
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
    contactPhone: "",
    contactEmail: "",
    description: "",
    established: 0,
    accreditation: "",
    affiliation: "",
    principal: "",
  })

  useEffect(() => {
    fetchCollege()
  }, [id])

  async function fetchCollege() {
    try {
      const res = await fetch(`/api/admin/colleges/${id}`)
      if (res.status === 401) {
        router.push("/")
        return
      }
      if (!res.ok) throw new Error("College not found")
      const data = await res.json()
      const college = data.college || data
      setName(college.name || "")
      setForm({
        shortName: college.shortName || "",
        type: college.type || "engineering",
        ownership: college.ownership || "private",
        location: college.location || "",
        district: college.district || "",
        website: college.website || "",
        contactPhone: college.contactPhone || "",
        contactEmail: college.contactEmail || "",
        description: college.description || "",
        established: college.established || 0,
        accreditation: college.accreditation || "",
        affiliation: college.affiliation || "",
        principal: college.principal || "",
      })
    } catch {
      setMessage({ type: "error", text: "Failed to load college" })
    } finally {
      setLoading(false)
    }
  }

  function setField(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...form, established: Number(form.established) }),
      })

      if (res.status === 401) {
        router.push("/")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update college")
      }

      setMessage({ type: "success", text: "College updated successfully" })
      setTimeout(() => router.push("/admin/colleges"), 1000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update college" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/colleges" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">Edit College</h1>
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
            />
            <p className="text-xs text-gray-500 mt-1">ID: {id}</p>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Update College
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
