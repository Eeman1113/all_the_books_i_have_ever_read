"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Loader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const seam = seamRef.current;
    const title = titleRef.current;
    if (!root || !left || !right || !seam || !title) return;

    const tl = gsap.timeline({
      onComplete: () => setDone(true),
    });

    tl.set(root, { autoAlpha: 1 })
      .from(title, {
        autoAlpha: 0,
        y: 12,
        duration: 0.55,
        ease: "power3.out",
      })
      .to(
        title,
        {
          autoAlpha: 0,
          y: -8,
          duration: 0.45,
          ease: "power2.in",
        },
        "+=0.55",
      )
      .to(
        seam,
        {
          scaleY: 0,
          transformOrigin: "center center",
          duration: 0.55,
          ease: "power2.inOut",
        },
        "-=0.2",
      )
      .to(
        left,
        {
          xPercent: -100,
          duration: 1.1,
          ease: "power4.inOut",
        },
        "-=0.25",
      )
      .to(
        right,
        {
          xPercent: 100,
          duration: 1.1,
          ease: "power4.inOut",
        },
        "<",
      );
  }, []);

  if (done) return null;

  return (
    <div
      id="__loader"
      ref={rootRef}
      className="fixed inset-0 pointer-events-none invisible"
      aria-hidden
    >
      {/* Two panels meeting at center */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 h-full w-1/2 bg-[var(--background-deep)]"
        style={{
          boxShadow: "inset -1px 0 0 rgba(60, 45, 25, 0.18)",
        }}
      />
      <div
        ref={rightRef}
        className="absolute top-0 right-0 h-full w-1/2 bg-[var(--background-deep)]"
        style={{
          boxShadow: "inset 1px 0 0 rgba(60, 45, 25, 0.18)",
        }}
      />
      {/* Center seam — looks like a closed book's spine */}
      <div
        ref={seamRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120vh] w-[2px]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(60,45,25,0.45) 20%, rgba(60,45,25,0.55) 50%, rgba(60,45,25,0.45) 80%, transparent 100%)",
        }}
      />
      {/* Title in middle */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex items-center justify-center px-6"
      >
        <span className="font-ole text-[var(--foreground)] text-3xl sm:text-5xl text-center select-none">
          opening the book
        </span>
      </div>
    </div>
  );
}
