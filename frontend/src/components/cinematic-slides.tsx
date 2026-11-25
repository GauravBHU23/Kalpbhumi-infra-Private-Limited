"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type CinematicSlide = {
  /** Unsplash photo id, e.g. "1517089596392-fb9a9033e05b", or a full image URL. */
  src: string;
  alt: string;
  caption?: string;
  /** CSS object-position, e.g. "center 48%". */
  position?: string;
};

/** Slow pan/zoom paths ("Ken Burns"); each slide gets a different one so the motion feels like camera moves. */
const MOVES: [string, string][] = [
  ["scale(1.05) translate(0%, 0%)", "scale(1.18) translate(-2.5%, -1.5%)"],
  ["scale(1.18) translate(2%, 1%)", "scale(1.05) translate(0%, 0%)"],
  ["scale(1.06) translate(-2%, 1.5%)", "scale(1.17) translate(2%, -1%)"],
  ["scale(1.16) translate(0%, -2%)", "scale(1.05) translate(-1.5%, 1.5%)"],
  ["scale(1.05) translate(2%, -1%)", "scale(1.18) translate(-1%, 2%)"],
];

function photoUrl(src: string, width: number) {
  return src.startsWith("http") || src.startsWith("/")
    ? src
    : `https://images.unsplash.com/photo-${src}?auto=format&fit=crop&w=${width}&q=70`;
}

function srcSet(src: string) {
  if (src.startsWith("http") || src.startsWith("/")) return undefined;
  return [640, 1024, 1600].map((w) => `${photoUrl(src, w)} ${w}w`).join(", ");
}

export function CinematicSlides({
  slides,
  className = "",
  interval = 6500,
  hud = false,
  hudClassName = "",
  sizes = "100vw",
  eager = false,
}: {
  slides: CinematicSlide[];
  className?: string;
  /** Time each slide stays on screen (ms). */
  interval?: number;
  /** Show video-style progress bars and the current caption. */
  hud?: boolean;
  hudClassName?: string;
  sizes?: string;
  /** Load the first image eagerly (above-the-fold use). */
  eager?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  // Only the current and the next slide get an image URL, so the next photo is ready before it fades in.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1 % Math.max(slides.length, 1)]));

  useEffect(() => {
    const next = (active + 1) % slides.length;
    setLoaded((set) => (set.has(active) && set.has(next) ? set : new Set([...set, active, next])));
  }, [active, slides.length]);

  // Play only while visible on screen, the tab is open and the user has not asked for reduced motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const update = () => setPlaying(visible && !document.hidden && !reduce.matches);
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.05 })
      : null;
    observer?.observe(root);
    document.addEventListener("visibilitychange", update);
    reduce.addEventListener?.("change", update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduce.removeEventListener?.("change", update);
    };
  }, [slides.length]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setPrevious(active);
      setActive((i) => (i + 1) % slides.length);
    }, interval);
    return () => window.clearTimeout(timer);
  }, [playing, active, interval, slides.length]);

  const vars = { "--cine-interval": `${interval}ms`, "--cine-move": `${interval + 1800}ms` } as CSSProperties;

  return (
    <div ref={rootRef} className={`cine ${playing ? "is-playing" : "is-paused"} ${className}`} style={vars}>
      {slides.map((slide, i) => {
        const [from, to] = MOVES[i % MOVES.length];
        const state = i === active ? " is-active" : i === previous ? " is-leaving" : "";
        return (
          <div key={slide.src} className={`cine-slide${state}`} aria-hidden={i !== active}
            style={{ "--kb-from": from, "--kb-to": to } as CSSProperties}>
            {loaded.has(i) && <img
              src={photoUrl(slide.src, 1280)}
              srcSet={srcSet(slide.src)}
              sizes={sizes}
              alt={i === active ? slide.alt : ""}
              style={slide.position ? { objectPosition: slide.position } : undefined}
              loading={eager || i > 0 ? "eager" : "lazy"}
              fetchPriority={eager && i === 0 ? "high" : "low"}
              decoding="async"
            />}
          </div>
        );
      })}
      {hud && slides.length > 1 && (
        <div className={`cine-hud ${hudClassName}`} aria-hidden="true">
          <span className="cine-caption">
            <b>{String(active + 1).padStart(2, "0")}</b> / {String(slides.length).padStart(2, "0")}
            {slides[active].caption && <em key={active}>{slides[active].caption}</em>}
          </span>
          <span className="cine-bars">
            {slides.map((slide, i) => (
              <span key={slide.src} className={`cine-bar${i < active ? " is-done" : ""}`}>
                {i === active && <i key={`${active}-${playing}`} />}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
