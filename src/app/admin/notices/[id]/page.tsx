"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2, ArrowLeft, Plus, Trash2, Search } from "lucide-react"
import Link from "next/link"

const noticeTypes = ["admission", "registration", "counselling", "spot_round", "vacant_seat", "merit_list", "waiting_list", "fee_payment", "reporting", "extension", "general"]
const editorialStatuses = ["published", "draft", "archived"]
const dateKinds = ["deadline", "important_date"]

interface StructuredDate {
  kind: string
  label: string
  date: string
}

export default function EditNoticePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [colleges, setColleges] = useState<{ id: string; name: string; shortName: string }[]>([])
  const [collegeSearch, setCollegeSearch] = useState("")
  const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [form, setForm] = useState({
    collegeId: "",
    type: "admission",
    publishedDate: "",
    lastDate: "",
    editorialStatus: "published",
    summary: "",
    officialUrl: "",
    pdfUrl: "",
  })
  const [documentsRequired, setDocumentsRequired] = useState<string[]>([])
  const [dates, setDates] = useState<StructuredDate[]>([])

  useEffect(() => {
    fetchNotice()
    fetch("/api/admin/colleges")
      .then((r) => r.json())
      .then((data) => setColleges(data.colleges || data || []))
      .catch(() => {})
  }, [id])

  async function fetchNotice() {
    try {
      const res = await fetch(`/api/admin/notices/${id}`)
      if (res.status === 401) {
        router.push("/")
        return
      }
      if (!res.ok) throw new Error("Notice not found")
      const notice = await res.json()
      setTitle(notice.title || "")
      const allDates: StructuredDate[] = (notice.dates || []).map((d: { kind: string; label: string; date: string }) => ({
        kind: d.kind,
        label: d.label,
        date: typeof d.date === "string" ? d.date.slice(0, 10) : "",
      }))
      // The legacy "Last Date" deadline is edited via its own field, not the
      // structured-dates list.
      const lastDateRow = allDates.find((d) => d.kind === "deadline" && d.label === "Last Date")
      setDates(allDates.filter((d) => d !== lastDateRow))
      setForm({
        collegeId: notice.collegeId || "",
        type: notice.type || "admission",
        publishedDate: notice.publishedAt ? String(notice.publishedAt).slice(0, 10) : "",
        lastDate: lastDateRow?.date || "",
        editorialStatus: notice.status || "published",
        summary: notice.summary || "",
        officialUrl: notice.officialUrl || "",
        pdfUrl: notice.pdfUrl || "",
      })
      setDocumentsRequired(notice.documentsRequired || [])
    } catch {
      setMessage({ type: "error", text: "Failed to load notice" })
    } finally {
      setLoading(false)
    }
  }

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateDate(i: number, key: keyof StructuredDate, value: string) {
    setDates((prev) => prev.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          ...form,
          documentsRequired: documentsRequired.filter(Boolean),
          dates: dates
            .filter((d) => d.label && d.date)
            .map((d) => ({ kind: d.kind, label: d.label, date: d.date })),
        }),
      })

      if (res.status === 401) {
        router.push("/")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update notice")
      }

      setMessage({ type: "success", text: "Notice updated successfully" })
      setTimeout(() => router.push("/admin/notices"), 1000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update notice" })
    } finally {
      setSubmitting(false)
    }
  }

  function ArrayField({
    label,
    items,
    setItems,
  }: {
    label: string
    items: string[]
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <button
            type="button"
            onClick={() => setItems([...items, ""])}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => setItems(items.map((v, idx) => (idx === i ? e.target.value : v)))}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-gray-400">No items added</p>
          )}
        </div>
      </div>
    )
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
        <Link href="/admin/notices" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">Edit Notice</h1>
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
          <h2 className="text-lg font-semibold">Notice Details</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">ID: {id}</p>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">College *</label>
            <button
              type="button"
              onClick={() => setCollegeDropdownOpen(!collegeDropdownOpen)}
              className="w-full px-3 py-2 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {form.collegeId
                ? colleges.find((c) => c.id === form.collegeId)?.name || form.collegeId
                : "Select a college..."}
            </button>
            {collegeDropdownOpen && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-2 border-b">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search colleges..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>
                {colleges
                  .filter(
                    (c) =>
                      c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
                      c.shortName.toLowerCase().includes(collegeSearch.toLowerCase()) ||
                      c.id.toLowerCase().includes(collegeSearch.toLowerCase())
                  )
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setField("collegeId", c.id)
                        setCollegeDropdownOpen(false)
                        setCollegeSearch("")
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        form.collegeId === c.id ? "bg-blue-50 dark:bg-blue-950 font-medium" : ""
                      }`}
                    >
                      <span className="block">{c.name}</span>
                      <span className="block text-xs text-gray-400">{c.shortName} — {c.id}</span>
                    </button>
                  ))}
                {colleges.filter(
                  (c) =>
                    c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
                    c.shortName.toLowerCase().includes(collegeSearch.toLowerCase()) ||
                    c.id.toLowerCase().includes(collegeSearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">No colleges found</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {noticeTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Editorial Status</label>
              <select
                value={form.editorialStatus}
                onChange={(e) => setField("editorialStatus", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editorialStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Live status (active/expired) is derived from dates automatically
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Published Date *</label>
              <input
                type="date"
                required
                value={form.publishedDate}
                onChange={(e) => setField("publishedDate", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Date (deadline)</label>
              <input
                type="date"
                value={form.lastDate}
                onChange={(e) => setField("lastDate", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary *</label>
            <textarea
              required
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Official URL</label>
              <input
                type="url"
                value={form.officialUrl}
                onChange={(e) => setField("officialUrl", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PDF URL</label>
              <input
                type="url"
                value={form.pdfUrl}
                onChange={(e) => setField("pdfUrl", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-5">
          <h2 className="text-lg font-semibold">Key Dates</h2>
          <p className="text-xs text-gray-400 -mt-3">
            Structured dates power the deadline engine (status, countdowns, calendar). The Last Date
            field above is stored as a deadline automatically.
          </p>
          <div className="space-y-2">
            {dates.map((d, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={d.kind}
                  onChange={(e) => updateDate(i, "kind", e.target.value)}
                  className="px-2 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateKinds.map((k) => (
                    <option key={k} value={k}>
                      {k === "deadline" ? "Deadline" : "Important Date"}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Label (e.g. Merit List)"
                  value={d.label}
                  onChange={(e) => updateDate(i, "label", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={d.date}
                  onChange={(e) => updateDate(i, "date", e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setDates(dates.filter((_, idx) => idx !== i))}
                  className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {dates.length === 0 && (
              <p className="text-xs text-gray-400">No additional dates added</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDates([...dates, { kind: "important_date", label: "", date: "" }])}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus size={12} />
            Add Date
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-5">
          <h2 className="text-lg font-semibold">Documents Required</h2>
          <ArrayField label="Documents Required" items={documentsRequired} setItems={setDocumentsRequired} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Update Notice
          </button>
          <Link
            href="/admin/notices"
            className="px-5 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
