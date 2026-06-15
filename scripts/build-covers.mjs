#!/usr/bin/env node
// Resolves an OpenLibrary cover URL for every book in src/app/books.ts
// and writes the map to src/app/covers.json so the app never has to hit
// the search API at runtime.
//
// Run: `npm run covers`

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BOOKS_PATH = resolve(ROOT, "src/app/books.ts");
const OUT_PATH = resolve(ROOT, "src/app/covers.json");
const CONCURRENCY = 6;
const RETRIES = 3;
const TIMEOUT_MS = 15000;

function parseBooks(src) {
  // Each book is an object literal inside the exported array. The structure
  // is uniform — extract the fields we need with focused regexes per block.
  const blocks = src.match(/\{\s*title:[\s\S]*?\},/g) ?? [];
  return blocks.map((block) => {
    const get = (name) =>
      block.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    return {
      title: get("title"),
      author: get("author"),
      query: get("query"),
      coverUrl: get("coverUrl"),
    };
  });
}

async function withTimeout(promise, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await promise(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

async function fetchOpenLibraryCover(book) {
  const q = book.query || `${book.title} ${book.author ?? ""}`.trim();
  const url =
    "https://openlibrary.org/search.json?q=" +
    encodeURIComponent(q) +
    "&fields=cover_i&limit=5";
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await withTimeout(
        (signal) =>
          fetch(url, {
            signal,
            headers: { "User-Agent": "bookify-cover-builder/1.0" },
          }),
        TIMEOUT_MS,
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      for (const doc of data?.docs ?? []) {
        if (doc?.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
        }
      }
      return null;
    } catch (err) {
      if (attempt === RETRIES) {
        console.warn(`  ✗ ${book.title} (OL): ${err.message}`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  return null;
}

async function fetchGoogleBooksCover(book) {
  const parts = [`intitle:"${book.title}"`];
  if (book.author) parts.push(`inauthor:"${book.author}"`);
  const url =
    "https://www.googleapis.com/books/v1/volumes?q=" +
    encodeURIComponent(parts.join(" ")) +
    "&maxResults=5";
  try {
    const res = await withTimeout(
      (signal) => fetch(url, { signal }),
      TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data?.items ?? []) {
      const links = item?.volumeInfo?.imageLinks;
      const raw = links?.thumbnail || links?.smallThumbnail;
      if (raw) {
        // upgrade http -> https, drop the curled-edge effect
        return raw.replace(/^http:/, "https:").replace(/&edge=curl/g, "");
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchCoverUrl(book) {
  const ol = await fetchOpenLibraryCover(book);
  if (ol) return ol;
  const gb = await fetchGoogleBooksCover(book);
  if (gb) return gb;
  return null;
}

function key(book) {
  return `${book.title}|${book.author ?? ""}`;
}

async function pool(items, size, worker) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: size }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const src = await readFile(BOOKS_PATH, "utf8");
  const books = parseBooks(src);
  console.log(`Resolving covers for ${books.length} books…`);

  let existing = {};
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    /* first run */
  }

  let resolved = 0;
  const results = await pool(books, CONCURRENCY, async (book) => {
    const k = key(book);
    // Manual override always wins so we can hand-paste URLs for books
    // OpenLibrary doesn't have.
    if (book.coverUrl) {
      resolved++;
      process.stdout.write(`\r  ${resolved}/${books.length} (override)`);
      return [k, book.coverUrl];
    }
    // Reuse already-resolved URLs to keep reruns fast and avoid API hits.
    if (existing[k]) {
      resolved++;
      process.stdout.write(`\r  ${resolved}/${books.length} (cached)`);
      return [k, existing[k]];
    }
    const url = await fetchCoverUrl(book);
    resolved++;
    process.stdout.write(`\r  ${resolved}/${books.length}`);
    return [k, url];
  });

  process.stdout.write("\n");
  const map = Object.fromEntries(results);
  const hits = Object.values(map).filter(Boolean).length;
  await writeFile(OUT_PATH, JSON.stringify(map, null, 2) + "\n");
  console.log(`✓ Wrote ${OUT_PATH}`);
  console.log(`  ${hits}/${books.length} covers resolved`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
