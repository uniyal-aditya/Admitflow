"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2, Plus } from "lucide-react"

interface Admin {
  _id?: string
  id?: string
  email: string
  role: string
  addedBy?: string
  createdAt?: string
}

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("admin")
  const [adding, setAdding] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState("")

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/admins")
      if (res.status === 401) {
        router.push("/")
        return
      }
      const data = await res.json()
      setAdmins(data.admins || data || [])
      if (data.currentUser) {
        setCurrentUserRole(data.currentUser.role || "")
      }
    } catch {
      setError("Failed to load admins")
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setMessage(null)

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      })

      if (res.status === 401) {
        router.push("/")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to add admin")
      }

      setMessage({ type: "success", text: "Admin added successfully" })
      setNewEmail("")
      setNewRole("admin")
      fetchAdmins()
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add admin" })
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Are you sure you want to remove this admin?")) return

    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/")
        return
      }
      if (!res.ok) throw new Error("Failed to remove admin")
      setAdmins((prev) => prev.filter((a) => (a._id || a.id) !== id))
      setMessage({ type: "success", text: "Admin removed" })
    } catch {
      setMessage({ type: "error", text: "Failed to remove admin" })
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
        <h1 className="text-2xl font-bold">Admins</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

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

      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Admin</h2>
        <form onSubmit={handleAdd} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            Add
          </button>
        </form>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No admins found</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Added By</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const aid = admin._id || admin.id || ""
                return (
                  <tr key={aid} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          admin.role === "superadmin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{admin.addedBy || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {currentUserRole === "superadmin" && (
                        <button
                          onClick={() => handleRemove(aid)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
