"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pause, Play, Megaphone } from "lucide-react";

interface Item { key: string; text: string; href: string }

/** Readable "Latest updates" strip: admin announcements first, then the newest published notices. */
export function NoticeTicker() {
  const [items, setItems] = useState<Item[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/banner").then((r) => r.json()).catch(() => []),
      fetch("/api/notices/latest").then((r) => r.json()).catch(() => []),
    ]).then(([banners, notices]) => {
      if (!alive) return;
      const list: Item[] = [
        ...(Array.isArray(banners) ? banners : []).map((b: { id: string; message: string }) => ({ key: `b-${b.id}`, text: b.message, href: "/notices" })),
        ...(Array.isArray(notices) ? notices : []).map((n: { id: string; title: string; college: string | null }) => ({
          key: `n-${n.id}`, text: n.college ? `${n.college}: ${n.title}` : n.title, href: `/notices/${n.id}`,
        })),
      ];
      setItems(list);
    });
    return () => { alive = false; };
  }, []);

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <section aria-label="Latest updates" className="border-b border-saffron-100 bg-saffron-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-saffron-500 px-3 text-sm font-semibold text-white sm:px-4">
          <Megaphone className="h-4 w-4" /> <span>Latest updates</span>
        </div>
        <div className="ticker-wrap relative min-w-0 flex-1 overflow-hidden py-2" data-paused={paused}>
          <ul className="ticker-track">
            {loop.map((it, i) => (
              <li key={`${it.key}-${i}`} className="flex items-center whitespace-nowrap px-6 text-sm" aria-hidden={i >= items.length}>
                <Link href={it.href} tabIndex={i >= items.length ? -1 : 0} className="text-indigo-900 hover:underline dark:text-indigo-200">{it.text}</Link>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume scrolling updates" : "Pause scrolling updates"}
          className="flex shrink-0 items-center px-3 text-indigo-900 hover:bg-saffron-100 dark:text-indigo-200 dark:hover:bg-gray-800"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </section>
  );
}
