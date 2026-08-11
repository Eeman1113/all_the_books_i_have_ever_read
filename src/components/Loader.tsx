"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Loader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const MIN_MS = 1200;
    const started = performance.now();

    const finish = () => {
      const waited = performance.now() - started;
      const remaining = Math.max(0, MIN_MS - waited);
      window.setTimeout(() => {
        if (!rootRef.current) {
          setMounted(false);
          return;
        }
        gsap.to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => setMounted(false),
        });
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      id="__loader"
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 flex items-center justify-center p-8 sm:p-12 bg-[var(--background)]"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="block w-[180px] sm:w-[220px] h-auto max-h-[70vh] object-contain"
      >
        <source src="loading.webm" type="video/webm" />
        <source src="loading.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
