"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, X } from "lucide-react"

interface Suggestion {
  _id?: string
  id?: string
  name: string
  type: string
  location: string
  district: string
  status: string
  suggestedAt: string
}

export default function SuggestionsPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  async function fetchSuggestions() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/stats")
      if (res.status === 401) {
        router.push("/")
        return
      }
      const data = await res.json()
      setSuggestions(data.suggestions?.recent || data.suggestions || [])
    } catch {
      setError("Failed to load suggestions")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    setProcessingId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (res.status === 401) {
        router.push("/")
        return
      }

      if (!res.ok) throw new Error("Failed to update suggestion")

      setSuggestions((prev) => prev.filter((s) => (s._id || s.id) !== id))

      if (status === "approved") {
        setMessage({ type: "success", text: "College was created from suggestion" })
      } else {
        setMessage({ type: "success", text: "Suggestion rejected" })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update suggestion" })
    } finally {
      setProcessingId(null)
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
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
        <h1 className="text-2xl font-bold">Suggestions</h1>
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

      {suggestions.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No pending suggestions</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Suggested</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((suggestion) => {
                const sid = suggestion._id || suggestion.id || ""
                return (
                  <tr key={sid} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{suggestion.name}</td>
                    <td className="px-4 py-3 capitalize">{suggestion.type}</td>
                    <td className="px-4 py-3">{suggestion.location}</td>
                    <td className="px-4 py-3">{suggestion.district}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(suggestion.status)}`}>
                        {suggestion.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {suggestion.suggestedAt
                        ? new Date(suggestion.suggestedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {suggestion.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(sid, "approved")}
                            disabled={processingId === sid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(sid, "rejected")}
                            disabled={processingId === sid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
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
