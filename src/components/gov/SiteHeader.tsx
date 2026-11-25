"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Menu, X, ChevronDown, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { navItems, mySpaceItems } from "@/data/site";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [q, setQ] = useState("");
  const spaceRef = useRef<HTMLLIElement>(null);

  useEffect(() => { setOpen(false); setSpaceOpen(false); }, [pathname]);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    fetch("/api/admin/check").then((r) => r.json()).then((d) => setIsAdmin(d.admin === true)).catch(() => {});
  }, [user]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (spaceRef.current && !spaceRef.current.contains(e.target as Node)) setSpaceOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSpaceOpen(false); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  const homeHref = user ? "/dashboard" : "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const link = (active: boolean) =>
    `block px-4 py-3 text-sm font-medium border-b-[3px] transition-colors ${
      active ? "border-saffron-500 bg-indigo-800 text-white" : "border-transparent text-white/90 hover:bg-indigo-800"
    }`;

  return (
    <>
      <header className="border-b border-indigo-100 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href={homeHref} className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12" />
            <span>
              <span className="block font-serif text-2xl font-bold leading-tight text-indigo-900 dark:text-white">AdmitFlow</span>
              <span className="block text-xs text-gray-600 dark:text-gray-400">Uttarakhand College Admission Companion</span>
            </span>
          </Link>

          <form data-tour="search" onSubmit={submit} role="search" className="flex w-full max-w-md items-center sm:w-auto sm:min-w-[22rem]">
            <label htmlFor="site-search" className="sr-only">Search colleges and notices</label>
            <input
              id="site-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search colleges, courses or notices"
              className="h-10 w-full rounded-l-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <button type="submit" aria-label="Search" className="flex h-10 w-11 items-center justify-center rounded-r-md bg-saffron-500 text-white hover:bg-saffron-600">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <nav aria-label="Main" className="sticky top-0 z-40 bg-indigo-900 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <ul className="hidden items-stretch md:flex">
            <li><Link href={homeHref} className={link(pathname === homeHref)}>Home</Link></li>
            {navItems.map((n) => (
              <li key={n.href}><Link href={n.href} data-tour={`nav-${n.label.toLowerCase()}`} className={link(isActive(n.href))} aria-current={isActive(n.href) ? "page" : undefined}>{n.label}</Link></li>
            ))}
            {user && (
              <li ref={spaceRef} className="relative">
                <button
                  type="button"
                  aria-expanded={spaceOpen}
                  aria-haspopup="menu"
                  data-tour="account"
                  onClick={() => setSpaceOpen((v) => !v)}
                  className={`flex items-center gap-1 ${link(false)}`}
                >
                  My space <ChevronDown className={`h-4 w-4 transition-transform ${spaceOpen ? "rotate-180" : ""}`} />
                </button>
                {spaceOpen && (
                  <ul role="menu" className="absolute left-0 top-full z-50 w-56 border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {mySpaceItems.map((m) => (
                      <li key={m.href} role="none">
                        <Link role="menuitem" href={m.href} className="block px-4 py-2 text-sm text-gray-800 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-800">{m.label}</Link>
                      </li>
                    ))}
                    <li role="none" className="border-t dark:border-gray-700">
                      <button role="menuitem" onClick={() => { setSpaceOpen(false); logout(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}
            {isAdmin && (
              <li><Link href="/admin" className={link(pathname.startsWith("/admin"))}><span className="inline-flex items-center gap-1"><Shield className="h-4 w-4" />Admin</span></Link></li>
            )}
          </ul>

          <button
            type="button"
            className="flex items-center gap-2 py-3 text-sm font-medium text-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-tour="menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />} Menu
          </button>
        </div>

        {open && (
          <ul id="mobile-menu" className="border-t border-indigo-700 md:hidden">
            {[{ href: homeHref, label: "Home" }, ...navItems, ...(user ? mySpaceItems : []), ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])].map((n) => (
              <li key={n.href + n.label}><Link href={n.href} className="block border-b border-indigo-800 px-4 py-3 text-sm text-white">{n.label}</Link></li>
            ))}
            {user && (
              <li><button onClick={() => { setOpen(false); logout(); }} className="block w-full px-4 py-3 text-left text-sm text-red-200">Sign out</button></li>
            )}
          </ul>
        )}
      </nav>
    </>
  );
}
