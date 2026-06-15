#!/usr/bin/env node
// Resolves a cover URL for every book in src/app/books.ts and writes the map
// to src/app/covers.json. Strategy per book:
//   1. coverUrl on the Book wins outright (manual override).
//   2. Search OpenLibrary, take the docs that have ISBNs.
//   3. For each ISBN (preferring newer editions), HEAD Amazon's image CDN.
//      A real cover is a JPEG >500 bytes; 43-byte GIF is Amazon's
//      placeholder for "no image".
//   4. Fall back to OpenLibrary's own cover_i if nothing on Amazon worked.
//
// Run: `npm run covers`         (uses cache, fast reruns)
//      `npm run covers -- --force` (re-resolve everything)

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BOOKS_PATH = resolve(ROOT, "src/app/books.ts");
const OUT_PATH = resolve(ROOT, "src/app/covers.json");
const CONCURRENCY = 5;
const RETRIES = 3;
const TIMEOUT_MS = 15000;
const FORCE = process.argv.includes("--force");

function parseBooks(src) {
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

function isbn13to10(isbn13) {
  if (isbn13.length !== 13 || !isbn13.startsWith("978")) return null;
  const base = isbn13.substring(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(base[i], 10) * (10 - i);
  const c = (11 - (sum % 11)) % 11;
  return base + (c === 10 ? "X" : String(c));
}

function normaliseIsbns(arr) {
  if (!arr) return [];
  const out = [];
  for (const raw of arr) {
    const s = String(raw).replace(/[-\s]/g, "");
    if (s.length === 10) out.push(s);
    else if (s.length === 13 && s.startsWith("978")) {
      const t = isbn13to10(s);
      if (t) out.push(t);
    }
  }
  return [...new Set(out)];
}

async function fetchOpenLibraryEditions(book) {
  const q = book.query || `${book.title} ${book.author ?? ""}`.trim();
  const url =
    "https://openlibrary.org/search.json?q=" +
    encodeURIComponent(q) +
    "&fields=cover_i,isbn,publish_year,title&limit=15";
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await withTimeout(
        (signal) =>
          fetch(url, {
            signal,
            headers: { "User-Agent": "bookify-cover-builder/2.0" },
          }),
        TIMEOUT_MS,
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const docs = (data?.docs ?? []).map((d) => ({
        cover_i: d.cover_i,
        isbns: normaliseIsbns(d.isbn),
        year: Array.isArray(d.publish_year)
          ? Math.max(...d.publish_year.filter((y) => Number.isFinite(y)), 0)
          : 0,
        title: d.title,
      }));
      docs.sort((a, b) => b.year - a.year);
      return docs;
    } catch (err) {
      if (attempt === RETRIES) {
        console.warn(`  ! OL search failed for ${book.title}: ${err.message}`);
        return [];
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  return [];
}

async function amazonCoverIfReal(isbn10) {
  const url = `https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`;
  try {
    const res = await withTimeout(
      (signal) => fetch(url, { method: "HEAD", signal }),
      TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const len = parseInt(res.headers.get("content-length") || "0", 10);
    const type = res.headers.get("content-type") || "";
    // Amazon serves a 43-byte 1x1 GIF as the "no image" placeholder.
    if (len < 800 || !type.startsWith("image/jpeg")) return null;
    return url;
  } catch {
    return null;
  }
}

async function resolveCover(book) {
  const docs = await fetchOpenLibraryEditions(book);
  // Walk newer-edition ISBNs first; first Amazon hit wins.
  const tried = new Set();
  for (const doc of docs) {
    for (const isbn of doc.isbns) {
      if (tried.has(isbn)) continue;
      tried.add(isbn);
      const u = await amazonCoverIfReal(isbn);
      if (u) return u;
      // Cap how many ISBNs we probe per book.
      if (tried.size >= 8) break;
    }
    if (tried.size >= 8) break;
  }
  // Amazon had nothing — fall back to the newest OL cover_i.
  for (const doc of docs) {
    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    }
  }
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
  console.log(
    `Resolving covers for ${books.length} books${FORCE ? " (forced refresh)" : ""}…`,
  );

  let existing = {};
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    /* first run */
  }

  let resolved = 0;
  const results = await pool(books, CONCURRENCY, async (book) => {
    const k = key(book);
    if (book.coverUrl) {
      resolved++;
      process.stdout.write(`\r  ${resolved}/${books.length} (override)`);
      return [k, book.coverUrl];
    }
    if (!FORCE && existing[k]) {
      resolved++;
      process.stdout.write(`\r  ${resolved}/${books.length} (cached)  `);
      return [k, existing[k]];
    }
    const url = await resolveCover(book);
    resolved++;
    process.stdout.write(`\r  ${resolved}/${books.length}          `);
    return [k, url];
  });

  process.stdout.write("\n");
  const map = Object.fromEntries(results);
  const hits = Object.values(map).filter(Boolean).length;
  const amazon = Object.values(map).filter((v) =>
    v?.includes("images-na.ssl-images-amazon.com"),
  ).length;
  await writeFile(OUT_PATH, JSON.stringify(map, null, 2) + "\n");
  console.log(`✓ Wrote ${OUT_PATH}`);
  console.log(
    `  ${hits}/${books.length} resolved · ${amazon} via Amazon · ${hits - amazon} via OL/manual`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
