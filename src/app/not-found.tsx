import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-bold text-indigo-800 dark:text-indigo-200">404</p>
      <h1 className="mt-2 border-b-4 border-saffron-500 pb-1 text-2xl font-bold text-indigo-900 dark:text-white">Page not found</h1>
      <p className="mt-4 text-gray-700 dark:text-gray-300">The page you are looking for does not exist or has moved. You can start again from one of these pages.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-md bg-indigo-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-900">Go to home</Link>
        <Link href="/colleges" className="rounded-md border border-indigo-800 px-5 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-800">Browse colleges</Link>
        <Link href="/notices" className="rounded-md border border-indigo-800 px-5 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-800">Read notices</Link>
      </div>
    </div>
  );
}
