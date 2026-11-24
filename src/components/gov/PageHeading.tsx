import Link from "next/link";

/** Shared page title: breadcrumb, serif heading with a saffron rule, optional description and action. */
export function PageHeading({
  title, description, crumbs = [], action,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className="mx-2">/</span>
              {c.href ? <Link href={c.href} className="hover:underline">{c.label}</Link> : <span aria-current="page" className="text-gray-900 dark:text-gray-200">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="inline-block border-b-4 border-saffron-500 pb-1 text-3xl font-bold text-indigo-900 dark:text-white">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-gray-700 dark:text-gray-300">{description}</p>}
      </div>
      {action}
    </div>
  );
}
