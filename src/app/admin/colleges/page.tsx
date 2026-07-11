"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react"

interface College {
  id: string
  name: string
  shortName: string
  type: string
  ownership: string
  district: string
}

export default function CollegesPage() {
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [filtered, setFiltered] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchColleges()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      colleges.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.ownership.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      )
    )
  }, [search, colleges])

  async function fetchColleges() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/colleges")
      if (res.status === 401) {
        router.push("/")
        return
      }
      const data = await res.json()
      setColleges(data.colleges || data || [])
    } catch {
      setError("Failed to load colleges")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this college?")) return
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" })
      if (res.status === 401) { router.push("/"); return }
      if (!res.ok) throw new Error("Failed to delete")
      setColleges((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert("Failed to delete college")
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
        <h1 className="text-2xl font-bold">Colleges</h1>
        <Link
          href="/admin/colleges/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add College
        </Link>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search colleges by name, ID, type, district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">{search ? "No colleges match your search" : "No colleges found"}</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Ownership</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((college) => (
                <tr key={college.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs">{college.id}</td>
                  <td className="px-4 py-3 font-medium">{college.name}</td>
                  <td className="px-4 py-3 capitalize">{college.type}</td>
                  <td className="px-4 py-3 capitalize">{college.ownership}</td>
                  <td className="px-4 py-3">{college.district}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/colleges/${college.id}`)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(college.id)}
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
