"use client";

import Link from "next/link";

// The raw error message is never shown to visitors (it can expose internals).
// The digest lets you find the matching entry in your server logs.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="border-b-4 border-saffron-500 pb-1 text-2xl font-bold text-indigo-900 dark:text-white">Something went wrong</h1>
      <p className="mt-4 text-gray-700 dark:text-gray-300">We could not load this page. Please try again. If the problem continues, come back in a few minutes.</p>
      {error.digest && <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Reference: {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="rounded-md bg-indigo-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-900">Try again</button>
        <Link href="/" className="rounded-md border border-indigo-800 px-5 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-800">Go to home</Link>
      </div>
    </div>
  );
}
