#!/usr/bin/env node
// Hand-curated cover URL replacements for the books the verification
// agents flagged as wrong (or that failed downloading initially).
// Run after redownload-via-ol.mjs; this just patches the specific files.

import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const COVERS_DIR = resolve(ROOT, "public/covers");

const FIXES = [
  {
    file: "the-adventures-of-sherlock-holmes.jpg",
    url: "https://images-na.ssl-images-amazon.com/images/P/0451528360.01.LZZZZZZZ.jpg",
    note: "Signet single-book edition (was an Adventures+Memoirs combined cover)",
  },
  {
    file: "the-memoirs-of-sherlock-holmes.jpg",
    url: "https://covers.openlibrary.org/b/id/9246429-L.jpg",
    note: "OL 1920 standalone Memoirs",
  },
  {
    file: "diary-of-a-wimpy-kid.jpg",
    url: "https://images-na.ssl-images-amazon.com/images/P/0141324902.01.LZZZZZZZ.jpg",
    note: "Penguin UK English edition (was Polish)",
  },
  {
    file: "the-ugly-truth.jpg",
    url: "https://images-na.ssl-images-amazon.com/images/P/0810984911.01.LZZZZZZZ.jpg",
    note: "Amulet US edition (was Spanish)",
  },
  {
    file: "the-meltdown.jpg",
    url: "https://images-na.ssl-images-amazon.com/images/P/1419727435.01.LZZZZZZZ.jpg",
    note: "Amulet US edition (was Polish)",
  },
  {
    file: "hot-mess.jpg",
    url: "https://images-na.ssl-images-amazon.com/images/P/1419766953.01.LZZZZZZZ.jpg",
    note: "Amulet US real cover (was a 'cover not revealed' placeholder)",
  },
  {
    file: "tom-gates-series.jpg",
    url: "https://covers.openlibrary.org/b/id/7557379-L.jpg",
    note: "The Brilliant World of Tom Gates — Pichon's first book",
  },
  {
    file: "catching-fire.jpg",
    url: "https://images-na.ssl-images-amazon.com/images/P/0439023491.01.LZZZZZZZ.jpg",
    note: "Scholastic standalone (was a Hunger Games box set)",
  },
  {
    file: "swami-and-friends.jpg",
    url: "https://covers.openlibrary.org/b/id/7240802-L.jpg",
    note: "Indian Thought original artwork (was Arabic edition)",
  },
  {
    file: "strange-buildings.jpg",
    url: "https://covers.openlibrary.org/b/id/15123137-L.jpg",
    note: "English release Strange Pictures (Pushkin Press)",
  },
  {
    file: "white-nights.jpg",
    url: "https://covers.openlibrary.org/b/id/14598226-L.jpg",
    note: "English White Nights (the earlier download failed)",
  },
];

async function downloadBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) throw new Error("not image: " + type);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) throw new Error("too small: " + buf.length);
  return buf;
}

async function main() {
  for (const fix of FIXES) {
    try {
      const buf = await downloadBytes(fix.url);
      await writeFile(resolve(COVERS_DIR, fix.file), buf);
      console.log(`✓ ${fix.file} (${buf.length}B) — ${fix.note}`);
    } catch (err) {
      console.log(`✗ ${fix.file} — ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
