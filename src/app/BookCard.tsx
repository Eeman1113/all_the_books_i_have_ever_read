"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Book } from "./books";
import covers from "./covers.json";
import { Badge } from "@/components/ui/badge";
import { HoverText } from "@/components/HoverText";

const coverMap = covers as Record<string, string | null>;

function coverFor(book: Book): string | null {
  return coverMap[`${book.title}|${book.author ?? ""}`] ?? null;
}

type AgeCategory = "Kid" | "Teen" | "Adult";

function ageCategory(whenRead: string): AgeCategory {
  const w = whenRead.toLowerCase();
  if (/adult|college/.test(w)) return "Adult";
  if (/teen|adolescent|\b16\b/.test(w)) return "Teen";
  return "Kid";
}

const tagPalette: Record<AgeCategory, { bg: string; text: string }> = {
  Kid: { bg: "#fef3c7", text: "#92400e" },
  Teen: { bg: "#d1fae5", text: "#065f46" },
  Adult: { bg: "#ede9fe", text: "#5b21b6" },
};

const FALLBACK_GLOW = "rgba(138, 106, 58, 0.45)";
const BASE_SHADOW = "0 12px 22px -14px rgba(40, 40, 40, 0.35)";

function extractDominantColor(img: HTMLImageElement): string | null {
  const canvas = document.createElement("canvas");
  const w = 50;
  const h = 50;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      // skip near-white/near-black so the glow picks up actual cover hues
      if (lum < 25 || lum > 230) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    if (count === 0) {
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }
    if (count === 0) return null;
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  } catch {
    return null;
  }
}

export default function BookCard({
  book,
  priority = false,
}: {
  book: Book;
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const coverUrl = coverFor(book);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [glowColor, setGlowColor] = useState<string | null>(null);

  const cat = ageCategory(book.whenRead);
  const palette = tagPalette[cat];
  const showSkeleton = !coverUrl || !loaded || errored;

  const onEnter = () => {
    setHovered(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, { y: -4, duration: 0.22, ease: "power2.out" });
    }
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        scale: 1.03,
        duration: 0.25,
        ease: "power2.out",
      });
    }
    if (!glowColor && imgRef.current && loaded) {
      const c = extractDominantColor(imgRef.current);
      if (c) setGlowColor(c);
    }
  };

  const onLeave = () => {
    setHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: "power2.out" });
    }
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        scale: 1,
        duration: 0.28,
        ease: "power2.out",
      });
    }
  };

  useEffect(() => {
    // SSR/hydration race: the <img> is inline in the static HTML, so the
    // browser decodes it during HTML parse and fires `load` before React
    // hydrates and attaches our onLoad listener. Check `complete` once on
    // mount and flip loaded ourselves.
    if (
      imgRef.current?.complete &&
      imgRef.current.naturalWidth > 0
    ) {
      setLoaded(true);
    }
    return () => {
      if (cardRef.current) gsap.killTweensOf(cardRef.current);
      if (coverRef.current) gsap.killTweensOf(coverRef.current);
    };
  }, []);

  const glow = glowColor ?? FALLBACK_GLOW;
  const boxShadow = hovered
    ? `${BASE_SHADOW}, 0 0 48px 6px ${glow}`
    : BASE_SHADOW;

  return (
    <article
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group flex flex-col sm:flex-row gap-5 sm:gap-9 will-change-transform"
    >
      <div
        className="relative shrink-0 w-[170px] sm:w-[150px] max-w-full self-center sm:self-start transition-[box-shadow] duration-200 ease-out"
        style={{ boxShadow }}
      >
        <div ref={coverRef} className="will-change-transform">
          {coverUrl && !errored && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={coverUrl}
              alt={`${book.title} cover`}
              width={300}
              height={450}
              className={`transition-opacity duration-200 ${
                loaded
                  ? "block w-full h-auto opacity-100"
                  : "absolute inset-0 h-full w-full opacity-0"
              }`}
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
            />
          )}
          {showSkeleton && (
            <div
              className={`w-full aspect-[2/3] flex flex-col items-center justify-center p-4 text-center ${
                coverUrl && !errored
                  ? "book-cover-skel"
                  : "bg-[#ececec]"
              }`}
            >
              {(errored || !coverUrl) && (
                <>
                  <span className="font-ole text-black/55 text-lg leading-tight">
                    {book.title}
                  </span>
                  {!coverUrl && (
                    <span className="mt-2 font-sans text-[0.65rem] uppercase tracking-[0.18em] text-black/35">
                      no cover yet
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col min-w-0 flex-1 w-full">
        <h3 className="font-sans text-[1.15rem] sm:text-[1.2rem] font-semibold tracking-tight text-[var(--foreground)] leading-snug">
          <HoverText>{book.title}</HoverText>
        </h3>
        {book.author && (
          <p className="mt-1.5 text-[0.74rem] sm:text-[0.82rem] text-[var(--muted)] font-medium tracking-wide uppercase">
            <HoverText>{book.author}</HoverText>
          </p>
        )}
        <p className="mt-4 sm:mt-6 text-[0.94rem] sm:text-[0.95rem] leading-[1.65] sm:leading-[1.7] text-[var(--foreground)]/85">
          <HoverText>{book.synopsis}</HoverText>
        </p>
        <div className="mt-6 sm:mt-auto sm:pt-8 flex items-center flex-wrap gap-x-2 gap-y-1.5">
          <span className="font-sans font-bold text-xs sm:text-sm text-[var(--foreground)] tracking-tight">
            <HoverText>I read this book when I was:</HoverText>
          </span>
          <Badge
            variant="secondary"
            style={{
              backgroundColor: palette.bg,
              color: palette.text,
              fontSize: "0.875rem",
              padding: "0.3rem 0.75rem",
            }}
          >
            <HoverText>{cat}</HoverText>
          </Badge>
        </div>
      </div>
    </article>
  );
}
