"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { books } from "./books";
import BookCard from "./BookCard";
import { HoverText } from "@/components/HoverText";

const TITLE = "all the books i have ever read";
const SUBTITLE = "(at least the ones i can remember)";

export default function Home() {
  const headerRef = useRef<HTMLElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-10 pt-12 sm:pt-28 pb-0">
        <header ref={headerRef} className="flex flex-col items-center text-center">
          <h1 className="font-ole text-[var(--foreground)] leading-[1.05] text-[2.4rem] sm:text-[5.4rem] md:text-[6.5rem] tracking-tight select-none break-words max-w-full">
            <HoverText>{TITLE}</HoverText>
          </h1>
          <p
            ref={subRef}
            className="mt-3 sm:mt-5 max-w-2xl font-sans text-[var(--muted)] text-sm sm:text-xl italic px-2"
          >
            <HoverText>{SUBTITLE}</HoverText>
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

        <div className="relative mt-8 sm:mt-12">
          {/* Soft floor that fades the page bg #faf8f5 down into the
              video's native white #fdfdfd. Full-viewport-width so the
              gradient doesn't have visible seams at the page gutters.
              Sits in source order BEFORE the content, so it renders
              underneath without needing z-index. */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 w-screen -top-48 sm:-top-72 bottom-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, #faf8f5 0%, #faf8f5 12%, #fdfdfd 100%)",
            }}
          />
          <div className="relative flex justify-center select-none pointer-events-none">
            <div className="relative w-full max-w-[260px] sm:max-w-[320px]">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster=""
                className="absolute bottom-0 -left-[6%] sm:-left-[12%] w-[58%] sm:w-[64%] h-auto z-0"
              >
                <source src="cat.webm" type="video/webm" />
                <source src="cat.mp4" type="video/mp4" />
              </video>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="portal.png"
                alt="A boy carrying a tall stack of books — books, the portal to another world"
                width={722}
                height={1107}
                loading="lazy"
                decoding="async"
                className="block relative z-10 w-full h-auto"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
