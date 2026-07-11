import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="rounded-2xl border bg-white p-8 text-center max-w-md dark:bg-gray-900 dark:border-gray-800">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Page not found</h2>
        <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
