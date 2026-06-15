"use client";

import * as React from "react";

const PALETTE = [
  "#FF3D8B", // hot pink
  "#FF7A1A", // tangerine
  "#FFD000", // sunshine yellow
  "#3BD160", // grass green
  "#1E9CFF", // cobalt sky
  "#8E2BFF", // grape
  "#FF4E4E", // coral red
  "#0AC8C8", // turquoise
  "#FF2EA8", // bubblegum
  "#16D88B", // mint
  "#FF9B2B", // peach orange
  "#B14BFF", // lavender pop
  "#FF1E5A", // raspberry
  "#22D3EE", // electric aqua
];

function pickColour() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function splashLetter(e: React.MouseEvent<HTMLSpanElement>) {
  const el = e.currentTarget;
  el.style.transition = "none";
  el.style.color = pickColour();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = "color 1.6s ease-out";
      el.style.color = "";
    });
  });
}

const SPAN_STYLE: React.CSSProperties = { transition: "color 1.6s ease-out" };

/**
 * Splits the children string into per-letter spans. Hovering a letter
 * snaps its colour to a random whimsical pick, then fades it back to
 * the inherited foreground over 1.6s.
 *
 * Whitespace is left as text nodes so word-wrapping stays natural.
 */
export function HoverText({ children }: { children: string }) {
  const out: React.ReactNode[] = [];
  let buffer = "";
  let key = 0;
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    // Whitespace passes through unwrapped so the browser keeps word
    // boundaries and line breaks.
    if (c === " " || c === "\n" || c === "\t") {
      buffer += c;
      continue;
    }
    if (buffer) {
      out.push(buffer);
      buffer = "";
    }
    out.push(
      <span
        key={key++}
        onMouseEnter={splashLetter}
        style={SPAN_STYLE}
      >
        {c}
      </span>,
    );
  }
  if (buffer) out.push(buffer);
  return <>{out}</>;
}
