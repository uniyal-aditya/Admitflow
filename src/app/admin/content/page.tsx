"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, Edit, Trash2, Loader2, Search,
  Building2, FileText, LayoutDashboard, Eye, CheckCircle, XCircle, Clock, AlertTriangle
} from "lucide-react"

interface CollegeItem {
  id: string
  name: string
  shortName: string
  type: string
  ownership: string
  district: string
}

interface NoticeItem {
  id: string
  title: string
  collegeId: string
  college?: { shortName?: string; name?: string }
  type: string
  status: string
  publishedDate: string
}

type Tab = "overview" | "colleges" | "notices"

export default function ContentManagerPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("overview")
  const [colleges, setColleges] = useState<CollegeItem[]>([])
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [collegeSearch, setCollegeSearch] = useState("")
  const [noticeSearch, setNoticeSearch] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/colleges").then((r) => r.json()),
      fetch("/api/admin/notices").then((r) => r.json()),
    ])
      .then(([collegeData, noticeData]) => {
        setColleges(collegeData.colleges || collegeData || [])
        setNotices(noticeData.notices || noticeData || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function deleteCollege(id: string) {
    if (!confirm("Delete this college and ALL its notices?")) return
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" })
      if (res.status === 401) { router.push("/"); return }
      if (!res.ok) throw new Error("Failed to delete")
      setColleges((prev) => prev.filter((c) => c.id !== id))
    } catch { alert("Failed to delete college") }
  }

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" })
      if (res.status === 401) { router.push("/"); return }
      if (!res.ok) throw new Error("Failed to delete")
      setNotices((prev) => prev.filter((n) => n.id !== id))
    } catch { alert("Failed to delete notice") }
  }

  function statusColor(status: string) {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "upcoming": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "expired": return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      default: return "bg-gray-100 text-gray-500"
    }
  }

  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.shortName.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.type.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.district.toLowerCase().includes(collegeSearch.toLowerCase())
  )

  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.type.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.status.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      (n.college?.shortName || n.collegeId).toLowerCase().includes(noticeSearch.toLowerCase())
  )

  const activeNotices = notices.filter((n) => n.status === "active")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage colleges, notices, and site content on the go</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/colleges/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add College
          </Link>
          <Link
            href="/admin/notices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            Add Notice
          </Link>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {([
          { key: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
          { key: "colleges" as Tab, label: `Colleges (${colleges.length})`, icon: Building2 },
          { key: "notices" as Tab, label: `Notices (${notices.length})`, icon: FileText },
        ]).map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{colleges.length}</p>
                  <p className="text-xs text-gray-500">Total Colleges</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeNotices.length}</p>
                  <p className="text-xs text-gray-500">Active Notices</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <Clock size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.filter((n) => n.status === "upcoming").length}</p>
                  <p className="text-xs text-gray-500">Upcoming Notices</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.filter((n) => n.status === "expired").length}</p>
                  <p className="text-xs text-gray-500">Expired Notices</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  Recent Colleges
                </h3>
                <button onClick={() => setTab("colleges")} className="text-xs text-blue-600 hover:underline">View all</button>
              </div>
              <div className="divide-y">
                {colleges.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.type} &middot; {c.district}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => router.push(`/admin/colleges/${c.id}`)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {colleges.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">No colleges yet</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  Recent Notices
                </h3>
                <button onClick={() => setTab("notices")} className="text-xs text-blue-600 hover:underline">View all</button>
              </div>
              <div className="divide-y">
                {notices.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-gray-400">{n.college?.shortName || n.collegeId} &middot; <span className={statusColor(n.status)}>{n.status}</span></p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => router.push(`/admin/notices/${n.id}`)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {notices.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">No notices yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "colleges" && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search colleges by name, ID, type, district..."
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
              className="w-full max-w-md pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredColleges.length === 0 ? (
            <div className="text-center py-20 text-gray-500">{collegeSearch ? "No colleges match your search" : "No colleges found"}</div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Short Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Ownership</th>
                    <th className="px-4 py-3 font-medium">District</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColleges.map((college) => (
                    <tr key={college.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">{college.name}</td>
                      <td className="px-4 py-3 text-gray-600">{college.shortName}</td>
                      <td className="px-4 py-3 capitalize">{college.type}</td>
                      <td className="px-4 py-3 capitalize">{college.ownership}</td>
                      <td className="px-4 py-3">{college.district}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/admin/colleges/${college.id}`)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                            title="Edit college"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/notices/new?collegeId=${college.id}`)}
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                            title="Add notice for this college"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            onClick={() => deleteCollege(college.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            title="Delete college"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "notices" && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notices by title, type, status, college..."
              value={noticeSearch}
              onChange={(e) => setNoticeSearch(e.target.value)}
              className="w-full max-w-md pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredNotices.length === 0 ? (
            <div className="text-center py-20 text-gray-500">{noticeSearch ? "No notices match your search" : "No notices found"}</div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">College</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Published</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotices.map((notice) => (
                    <tr key={notice.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium max-w-[250px] truncate">{notice.title}</td>
                      <td className="px-4 py-3 text-gray-600">{notice.college?.shortName || notice.collegeId}</td>
                      <td className="px-4 py-3 capitalize">{notice.type?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(notice.status)}`}>
                          {notice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {notice.publishedDate ? new Date(notice.publishedDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/admin/notices/${notice.id}`)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                            title="Edit notice"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => deleteNotice(notice.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            title="Delete notice"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}