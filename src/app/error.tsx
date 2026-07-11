"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="rounded-2xl border bg-white p-8 text-center max-w-md dark:bg-gray-900 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
