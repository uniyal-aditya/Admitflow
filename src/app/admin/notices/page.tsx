"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"

interface Notice {
  id: string
  title: string
  collegeId: string
  college?: { shortName?: string }
  type: string
  status: string
  publishedDate: string
}

export default function NoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/notices")
      if (res.status === 401) {
        router.push("/")
        return
      }
      const data = await res.json()
      setNotices(data.notices || data || [])
    } catch {
      setError("Failed to load notices")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/")
        return
      }
      if (!res.ok) throw new Error("Failed to delete")
      setNotices((prev) => prev.filter((n) => n.id !== id))
    } catch {
      alert("Failed to delete notice")
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "upcoming":
        return "bg-yellow-100 text-yellow-700"
      case "expired":
        return "bg-gray-100 text-gray-500"
      default:
        return "bg-gray-100 text-gray-500"
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notices</h1>
        <Link
          href="/admin/notices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Notice
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {notices.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No notices found</div>
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
              {notices.map((notice) => (
                <tr key={notice.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{notice.title}</td>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/notices/${notice.id}`)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-600 hover:text-red-600"
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
  )
}
