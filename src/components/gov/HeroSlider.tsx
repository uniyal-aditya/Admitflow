"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { heroSlides } from "@/data/site";
import { SafeImage } from "./SafeImage";

const INTERVAL_MS = 7000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = heroSlides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setPlaying(false);
  }, []);

  const go = useCallback((n: number) => setIndex((n + count) % count), [count]);

  useEffect(() => {
    if (!playing || hovered || reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(t);
  }, [playing, hovered, reduced, count]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative h-[26rem] w-full overflow-hidden bg-indigo-900 md:h-[30rem]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onKeyDown={onKey}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <SafeImage src={s.image} alt={s.alt} priority={i === 0} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-950/60 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-4 pb-10">
            <div className="max-w-xl text-white">
              <h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl">{s.title}</h2>
              <p className="mt-3 text-base text-white/90 md:text-lg">{s.text}</p>
              <Link
                href={s.cta.href}
                tabIndex={i === index ? 0 : -1}
                className="mt-6 inline-block rounded-md bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-saffron-600"
              >
                {s.cta.label}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-indigo-950/70 px-4 py-2">
        <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-saffron-500" : "w-2.5 bg-white/60 hover:bg-white"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 text-white">
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause slideshow" : "Play slideshow"} className="rounded p-1.5 hover:bg-white/15">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="rounded p-1.5 hover:bg-white/15"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="rounded p-1.5 hover:bg-white/15"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
}
