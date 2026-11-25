"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface Issue { id: string; title: string; college: string; problem: string }
interface Health { counts: { total: number; published: number; drafts: number; archived: number; issues: number }; issues: Issue[] }

/** Short report of notices that need attention. */
export function NoticeHealth() {
  const [data, setData] = useState<Health | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/admin/notices/health", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return null
  if (!data) return null
  const { counts, issues } = data

  return (
    <section aria-label="Notice health" className="mb-6 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-800 dark:text-gray-200">
        <strong>{counts.total}</strong> notices: {counts.published} published, {counts.drafts} drafts, {counts.archived} archived.
      </p>
      {issues.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-800 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4" /> No problems found.
        </p>
      ) : (
        <>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-saffron-700 dark:text-saffron-400">
            <AlertTriangle className="h-4 w-4" /> {issues.length} thing{issues.length === 1 ? "" : "s"} to check
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {issues.slice(0, 8).map((i, idx) => (
              <li key={`${i.id}-${idx}`}>
                <Link href={`/admin/notices/${i.id}`} className="font-semibold text-indigo-800 underline dark:text-indigo-200">{i.title}</Link>
                <span className="text-gray-700 dark:text-gray-300"> ({i.college}): {i.problem}</span>
              </li>
            ))}
          </ul>
          {issues.length > 8 && <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">And {issues.length - 8} more.</p>}
        </>
      )}
    </section>
  )
}
