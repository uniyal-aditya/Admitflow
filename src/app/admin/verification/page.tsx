"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, ExternalLink, Loader2, Search, Undo2 } from "lucide-react";

interface Attr {
  id: string; field: string; confirmed: boolean; verifiedBy: string | null; verifiedAt: string | null;
  source: { id: string; name: string; url: string | null; verification: string };
}
interface Row { id: string; name: string; shortName: string; district: string; confirmed: number; pending: number; attributions: Attr[] }

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Needs review" },
  { key: "confirmed", label: "Has confirmed facts" },
  { key: "none", label: "Not started" },
] as const;

export default function VerificationPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("pending");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ fieldPath: "website", sourceUrl: "", sourceName: "" });

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/verification", { cache: "no-store" });
    if (!res.ok) { setError("Could not load the list."); setLoading(false); return; }
    const data = await res.json();
    setRows(data.colleges); setFields(data.fields); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (t && !`${r.name} ${r.shortName} ${r.district}`.toLowerCase().includes(t)) return false;
      if (filter === "pending") return r.pending > 0;
      if (filter === "confirmed") return r.confirmed > 0;
      if (filter === "none") return r.confirmed === 0 && r.pending === 0;
      return true;
    });
  }, [rows, q, filter]);

  async function call(method: "POST" | "PATCH", body: object) {
    setBusy(true); setError("");
    const res = await fetch("/api/admin/verification", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Something went wrong.");
    await load(); setBusy(false);
    return res.ok;
  }

  const input = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <div className="max-w-5xl">
      <h1 className="inline-block border-b-4 border-saffron-500 pb-1 text-3xl font-bold text-indigo-900 dark:text-white">Data verification</h1>
      <p className="mt-3 max-w-2xl text-gray-700 dark:text-gray-300">
        Open the official source yourself, check the fact, then confirm it. Only confirmed facts are shown to visitors as &quot;checked by our team&quot;.
      </p>

      {error && <p role="alert" className="mt-4 rounded-md border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <label htmlFor="v-search" className="sr-only">Search colleges</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input id="v-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colleges" className={`${input} pl-9`} />
        </div>
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${filter === f.key ? "border-indigo-800 bg-indigo-800 text-white" : "border-gray-300 bg-white text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-200"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-gray-700 dark:text-gray-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300" role="status">{shown.length} college{shown.length === 1 ? "" : "s"}</p>
          <ul className="mt-2 space-y-3">
            {shown.map((r) => (
              <li key={r.id} className="rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <span>
                    <span className="block font-serif text-lg font-semibold text-indigo-900 dark:text-white">{r.name}</span>
                    <span className="block text-sm text-gray-700 dark:text-gray-300">{r.district}</span>
                  </span>
                  <span className="flex shrink-0 gap-2 text-xs font-semibold">
                    <span className="rounded bg-green-100 px-2 py-1 text-green-900 dark:bg-green-900/40 dark:text-green-200">{r.confirmed} confirmed</span>
                    <span className="rounded bg-saffron-100 px-2 py-1 text-saffron-700 dark:bg-saffron-700/30 dark:text-saffron-100">{r.pending} to review</span>
                  </span>
                </button>

                {open === r.id && (
                  <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    {r.attributions.length === 0 ? (
                      <p className="text-sm text-gray-700 dark:text-gray-300">No facts have been confirmed or researched yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {r.attributions.map((a) => (
                          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 p-3 text-sm dark:border-gray-700">
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                {a.confirmed ? <CheckCircle2 className="h-4 w-4 text-gov-green-600" /> : <Clock className="h-4 w-4 text-saffron-600" />}
                                {a.field}
                                <span className="font-normal text-gray-700 dark:text-gray-300">{a.confirmed ? `confirmed by ${a.verifiedBy ?? "an admin"}` : "waiting for you"}</span>
                              </span>
                              {a.source.url ? (
                                <a href={a.source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-indigo-800 underline dark:text-indigo-200">
                                  {a.source.name} <ExternalLink className="h-3 w-3 shrink-0" /><span className="sr-only">(opens in a new tab)</span>
                                </a>
                              ) : <span className="mt-1 block text-gray-700 dark:text-gray-300">{a.source.name}</span>}
                            </span>
                            <button disabled={busy} type="button" onClick={() => void call("PATCH", { attributionId: a.id, action: a.confirmed ? "revoke" : "confirm" })}
                              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold disabled:opacity-50 ${a.confirmed ? "border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800" : "bg-indigo-800 text-white hover:bg-indigo-900"}`}>
                              {a.confirmed ? <><Undo2 className="h-4 w-4" /> Take back</> : "I checked this source: confirm"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form className="mt-5 grid gap-3 border-t border-gray-200 pt-4 sm:grid-cols-[10rem_1fr_1fr_auto] dark:border-gray-800"
                      onSubmit={async (e) => { e.preventDefault(); if (await call("POST", { collegeId: r.id, ...form })) setForm({ ...form, sourceUrl: "", sourceName: "" }); }}>
                      <div>
                        <label htmlFor={`f-${r.id}`} className="mb-1 block text-xs font-semibold text-indigo-900 dark:text-indigo-200">Fact</label>
                        <select id={`f-${r.id}`} value={form.fieldPath} onChange={(e) => setForm({ ...form, fieldPath: e.target.value })} className={input}>
                          {fields.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`u-${r.id}`} className="mb-1 block text-xs font-semibold text-indigo-900 dark:text-indigo-200">Official source address</label>
                        <input id={`u-${r.id}`} required type="url" placeholder="https://..." value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} className={input} />
                      </div>
                      <div>
                        <label htmlFor={`n-${r.id}`} className="mb-1 block text-xs font-semibold text-indigo-900 dark:text-indigo-200">Source name (optional)</label>
                        <input id={`n-${r.id}`} value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} className={input} />
                      </div>
                      <button disabled={busy} type="submit" className="self-end rounded-md bg-saffron-500 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-600 disabled:opacity-50">Confirm fact</button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
