"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Book } from "./books";
import { Button } from "@/components/ui/button";

const COVER_CACHE_KEY = "bookify:covers:v2";

type CoverCache = Record<string, string | null>;

function readCache(): CoverCache {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache: CoverCache) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* quota — ignore */
  }
}

async function fetchCover(book: Book): Promise<string | null> {
  const query = book.query || `${book.title} ${book.author ?? ""}`.trim();
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    query,
  )}&fields=cover_i&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data?.docs?.[0];
  if (doc?.cover_i) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
  }
  return null;
}

export default function BookCard({
  book,
  priority = false,
}: {
  book: Book;
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cache = readCache();
    const key = `${book.title}|${book.author ?? ""}`;
    if (key in cache) {
      setCoverUrl(cache[key]);
      return;
    }
    fetchCover(book)
      .then((url) => {
        if (cancelled) return;
        cache[key] = url;
        writeCache(cache);
        setCoverUrl(url);
      })
      .catch(() => {
        if (cancelled) return;
        setCoverUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [book]);

  useEffect(() => {
    const card = cardRef.current;
    const cover = coverRef.current;
    if (!card || !cover) return;

    const onEnter = () => {
      gsap.to(card, { y: -4, duration: 0.55, ease: "power3.out" });
      gsap.to(cover, {
        scale: 1.04,
        rotate: -1.2,
        duration: 0.7,
        ease: "power3.out",
      });
    };
    const onLeave = () => {
      gsap.to(card, { y: 0, duration: 0.6, ease: "power3.out" });
      gsap.to(cover, {
        scale: 1,
        rotate: 0,
        duration: 0.65,
        ease: "power3.out",
      });
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const showSkeleton = !coverUrl || !loaded || errored;

  return (
    <article
      ref={cardRef}
      className="group flex gap-5 sm:gap-6 will-change-transform"
    >
      <div
        ref={imgWrapRef}
        className="relative shrink-0 w-[120px] sm:w-[140px] aspect-[2/3] overflow-hidden bg-[#ececec]"
        style={{
          boxShadow: "0 14px 24px -12px rgba(60, 45, 25, 0.45)",
        }}
      >
        <div
          ref={coverRef}
          className="absolute inset-0 will-change-transform"
        >
          {coverUrl && !errored ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={`${book.title} cover`}
              width={300}
              height={450}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : null}
          {showSkeleton && (
            <div className="absolute inset-0 book-cover-skel flex items-end p-3">
              <span className="font-ole text-black/50 text-base leading-tight">
                {errored || coverUrl === null ? book.title : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <h3 className="font-sans text-[1.05rem] sm:text-[1.15rem] font-semibold tracking-tight text-[var(--foreground)] leading-snug">
          {book.title}
        </h3>
        {book.author && (
          <p className="mt-0.5 text-[0.78rem] sm:text-[0.82rem] text-[var(--muted)] font-medium tracking-wide uppercase">
            {book.author}
          </p>
        )}
        <p className="mt-3 text-[0.92rem] sm:text-[0.95rem] leading-relaxed text-[var(--foreground)]/85">
          {book.synopsis}
        </p>
        <div className="mt-4">
          <Button variant="secondary">{book.whenRead}</Button>
        </div>
      </div>
    </article>
  );
}
