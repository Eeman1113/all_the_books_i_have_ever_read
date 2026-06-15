"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { books } from "./books";
import BookCard from "./BookCard";

const TITLE = "all the books i have ever read";

// Zen-pastel Japanese palette — sakura, matcha, fuji, asagi, kaki, etc.
const ZEN_PALETTE = [
  "#F8BBD0", // sakura — cherry blossom pink
  "#A5D6A7", // matcha — soft green
  "#9FB7DE", // ai — indigo
  "#FFAB91", // kaki — persimmon
  "#CE93D8", // sumire — violet
  "#FFE082", // yamabuki — soft gold
  "#B2EBF2", // asagi — pale blue
  "#D7CCC8", // shiratake — pale brown
  "#C5E1A5", // moegi — young green
  "#D1C4E9", // fuji — wisteria
  "#F48FB1", // momo — peach
  "#BCAAA4", // cha — tea
];

function pickColour() {
  return ZEN_PALETTE[Math.floor(Math.random() * ZEN_PALETTE.length)];
}

export default function Home() {
  const headerRef = useRef<HTMLElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const splashLetter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    el.style.transition = "none";
    el.style.color = pickColour();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "color 1.6s ease-out";
        el.style.color = "";
      });
    });
  };

  useEffect(() => {
    if (!headerRef.current) return;
    const tl = gsap.timeline();
    tl.from(headerRef.current, {
      autoAlpha: 0,
      y: 14,
      duration: 0.32,
      ease: "power2.out",
    })
      .from(
        subRef.current,
        {
          autoAlpha: 0,
          y: 8,
          duration: 0.26,
          ease: "power2.out",
        },
        "-=0.18",
      )
      .from(
        gridRef.current?.children ?? [],
        {
          autoAlpha: 0,
          y: 14,
          duration: 0.28,
          ease: "power2.out",
          stagger: 0.012,
        },
        "-=0.12",
      );
  }, []);

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-10 pt-14 sm:pt-28 pb-20 sm:pb-36">
        <header ref={headerRef} className="flex flex-col items-center text-center">
          <h1 className="font-ole text-[var(--foreground)] leading-[1.05] text-[2.2rem] sm:text-[4.2rem] md:text-[5rem] tracking-tight select-none">
            {TITLE.split("").map((c, i) => {
              const isSpace = c === " ";
              return (
                <span
                  key={i}
                  onMouseEnter={isSpace ? undefined : splashLetter}
                  style={{
                    transition: "color 1.6s ease-out",
                    display: "inline-block",
                  }}
                >
                  {isSpace ? " " : c}
                </span>
              );
            })}
          </h1>
          <p
            ref={subRef}
            className="mt-3 sm:mt-4 max-w-2xl font-sans text-[var(--muted)] text-sm sm:text-lg italic px-4"
          >
            (at least the ones i can remember)
          </p>
        </header>

        <section
          ref={gridRef}
          className="mt-14 sm:mt-28 grid grid-cols-1 md:grid-cols-2 gap-x-10 sm:gap-x-16 lg:gap-x-20 gap-y-12 sm:gap-y-20"
        >
          {books.map((b, i) => (
            <BookCard
              key={`${b.title}-${b.author ?? ""}`}
              book={b}
              priority={i < 6}
            />
          ))}
        </section>

      </main>
    </>
  );
}
