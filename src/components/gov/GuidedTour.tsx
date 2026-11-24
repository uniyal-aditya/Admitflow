"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Lightbulb, ArrowUp, ArrowDown } from "lucide-react";
import { Tour, TourStep, siteTour, tourForPath } from "@/data/tours";

export const START_TOUR_EVENT = "af:start-tour";

interface Box { top: number; left: number; width: number; height: number }

const PAD = 8;
const ARROW = 36;
const GAP = 8;
const CARD_W = 340;

function visibleTarget(step: TourStep): HTMLElement | null {
  for (const sel of step.selectors ?? []) {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/** Keep steps that are centred, or whose target is on screen right now. */
function resolveSteps(tour: Tour): TourStep[] {
  return tour.steps.filter((s) => !s.selectors || visibleTarget(s));
}

export function GuidedTour() {
  const pathname = usePathname();
  const [tour, setTour] = useState<Tour | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [cardH, setCardH] = useState(200);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const step = tour ? steps[index] : undefined;

  const start = useCallback((t: Tour) => {
    const resolved = resolveSteps(t);
    if (resolved.length === 0) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setTour(t);
    setSteps(resolved);
    setIndex(0);
  }, []);

  const finish = useCallback(() => {
    if (tour) { try { localStorage.setItem(tour.storageKey, "done"); } catch {} }
    setTour(null);
    setSteps([]);
    setBox(null);
    returnFocus.current?.focus?.();
  }, [tour]);

  // Replay on request (Guide button).
  useEffect(() => {
    const onStart = () => start(tourForPath(pathname) ?? siteTour);
    window.addEventListener(START_TOUR_EVENT, onStart);
    return () => window.removeEventListener(START_TOUR_EVENT, onStart);
  }, [pathname, start]);

  // First visit: start automatically, once, after the page has settled.
  useEffect(() => {
    setTour(null); setSteps([]); setBox(null);
    const t = tourForPath(pathname);
    if (!t || !t.auto) return;
    let seen = true;
    try { seen = localStorage.getItem(t.storageKey) === "done"; } catch {}
    if (seen) return;
    const timer = setTimeout(() => start(t), 1200);
    return () => clearTimeout(timer);
  }, [pathname, start]);

  // Point at the current target and keep the highlight aligned on scroll/resize.
  const measure = useCallback(() => {
    if (!step?.selectors) { setBox(null); return; }
    const el = visibleTarget(step);
    if (!el) { setBox(null); return; }
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return;
    if (step.selectors) visibleTarget(step)?.scrollIntoView({ block: "center", behavior: "auto" });
    measure();
    setCardH(cardRef.current?.offsetHeight ?? 200);
    nextRef.current?.focus();
    let raf = 0;
    const onMove = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onMove, true); window.removeEventListener("resize", onMove); };
  }, [step, measure]);

  // Keyboard: Esc skips, arrows move, Tab stays inside the guide.
  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); finish(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setIndex((i) => Math.min(i + 1, steps.length - 1)); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Tab" && cardRef.current) {
        const f = cardRef.current.querySelectorAll<HTMLElement>("button");
        if (f.length === 0) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tour, steps.length, finish]);

  if (!tour || !step) return null;

  const isLast = index === steps.length - 1;
  const vw = typeof window === "undefined" ? 1024 : window.innerWidth;
  const vh = typeof window === "undefined" ? 768 : window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 24);

  // Card and arrow placement.
  let cardStyle: React.CSSProperties;
  let arrow: { x: number; y: number; up: boolean } | null = null;
  if (box) {
    const below = vh - (box.top + box.height + PAD) > cardH + ARROW + GAP * 2 + 12;
    const cx = box.left + box.width / 2;
    const left = Math.min(Math.max(cx - cardW / 2, 12), vw - cardW - 12);
    if (below) {
      arrow = { x: cx, y: box.top + box.height + PAD + 2, up: true };
      cardStyle = { top: box.top + box.height + PAD + ARROW + GAP, left, width: cardW };
    } else {
      arrow = { x: cx, y: box.top - PAD - ARROW - 2, up: false };
      cardStyle = { top: Math.max(12, box.top - PAD - ARROW - GAP - cardH), left, width: cardW };
    }
  } else {
    cardStyle = { top: Math.max(12, (vh - cardH) / 2), left: Math.max(12, (vw - cardW) / 2), width: cardW };
  }

  return (
    <div className="fixed inset-0 z-[300]" role="presentation">
      {/* Dimmed screen. It also blocks clicks on the page while the guide is open. */}
      {box ? (
        <div
          aria-hidden
          className="tour-pulse pointer-events-none fixed rounded-lg"
          style={{
            top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(5, 21, 46, 0.78)",
            outline: "3px solid var(--color-saffron-500)",
          }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 bg-indigo-950/80" />
      )}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} aria-hidden />

      {arrow && (
        <div
          aria-hidden
          className="tour-bounce pointer-events-none fixed text-saffron-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          style={{ left: arrow.x - ARROW / 2, top: arrow.y, width: ARROW, height: ARROW }}
        >
          {arrow.up ? <ArrowUp className="h-full w-full" strokeWidth={3} /> : <ArrowDown className="h-full w-full" strokeWidth={3} />}
        </div>
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        className="fixed rounded-lg border-t-4 border-saffron-500 bg-white p-5 text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-gray-100"
        style={cardStyle}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-saffron-600" aria-hidden>
            <Lightbulb className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-saffron-700 dark:text-saffron-400">Guide, step {index + 1} of {steps.length}</p>
            <h2 id="tour-title" className="mt-0.5 font-serif text-lg font-bold text-indigo-900 dark:text-white">{step.title}</h2>
          </div>
        </div>
        <p id="tour-text" className="mt-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">{step.text}</p>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 rounded-full ${i === index ? "w-6 bg-saffron-500" : i < index ? "w-1.5 bg-indigo-700" : "w-1.5 bg-gray-300 dark:bg-gray-600"}`} />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className="text-sm font-medium text-gray-700 underline hover:text-indigo-900 dark:text-gray-300 dark:hover:text-white">
            {isLast ? "Close" : "Skip tour"}
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={() => setIndex((i) => i - 1)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 dark:border-gray-600 dark:text-indigo-200 dark:hover:bg-gray-800">Back</button>
            )}
            <button ref={nextRef} type="button" onClick={() => (isLast ? finish() : setIndex((i) => i + 1))} className="rounded-md bg-indigo-800 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-900">
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
