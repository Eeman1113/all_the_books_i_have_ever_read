"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { books } from "./books";
import BookCard from "./BookCard";

export default function Home() {
  const headerRef = useRef<HTMLElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const tl = gsap.timeline();
    tl.from(headerRef.current, {
      autoAlpha: 0,
      y: 24,
      duration: 0.9,
      ease: "power3.out",
    })
      .from(
        subRef.current,
        {
          autoAlpha: 0,
          y: 14,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.5",
      )
      .from(
        gridRef.current?.children ?? [],
        {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.04,
        },
        "-=0.3",
      );
  }, []);

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 sm:px-10 pt-20 sm:pt-28 pb-28 sm:pb-36">
        <header ref={headerRef} className="flex flex-col items-center text-center">
          <h1 className="font-ole text-[var(--foreground)] leading-[1.05] text-[2.6rem] sm:text-[4.2rem] md:text-[5rem] tracking-tight">
            all the books i have ever read
          </h1>
          <p
            ref={subRef}
            className="mt-3 sm:mt-4 max-w-2xl font-sans text-[var(--muted)] text-base sm:text-lg italic"
          >
            (at least the ones i can remember)
          </p>
        </header>

        <section
          ref={gridRef}
          className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-2 gap-x-10 sm:gap-x-16 lg:gap-x-20 gap-y-14 sm:gap-y-20"
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
