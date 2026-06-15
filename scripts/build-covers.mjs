#!/usr/bin/env node
// Resolves a cover URL for every book in src/app/books.ts and writes the map
// to src/app/covers.json.
//
// Per book:
//   1. book.coverUrl is used as-is (manual override).
//   2. Open Library is searched (book.query takes precedence — free-form q=,
//      otherwise structured title=&author=).
//   3. Each doc gets a title score, author check, and a "clean English" check
//      so we skip the mass multi-language merged records (whose ISBN list
//      mixes languages).
//   4. ISBNs from the surviving docs are walked newest-first, HEAD-probed on
//      Amazon's images/P/<ISBN10>.01.LZZZZZZZ.jpg. We accept only
//      image/jpeg > 800 bytes (43-byte gif = Amazon "no image" placeholder).
//   5. Final fallback: the newest matched doc's cover_i on OpenLibrary.
//
// Run: `npm run covers`               (cached reruns are fast)
//      `npm run covers -- --force`    (ignore covers.json cache)

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
const MAX_ISBN_PROBES = 10;
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

function normaliseStr(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const REJECT_TERMS =
  /\b(trilogy|series|collection|complete|box ?set|boxset|combo|graphic novel)\b/;
const STUDY_GUIDE_RE =
  /\b(sparknotes|study guide|summary of|workbook on|trivia|companion to|guide to|cliffsnotes|book club)\b/i;

function titleScore(docTitle, bookTitle) {
  if (STUDY_GUIDE_RE.test(docTitle || "")) return 0;
  const a = normaliseStr(docTitle);
  const b = normaliseStr(bookTitle);
  if (!a || !b) return 0;
  if (a === b) return 4;
  if (a.startsWith(b + " ")) {
    if (REJECT_TERMS.test(a.substring(b.length + 1))) return 0;
    return 3;
  }
  if (a.endsWith(" " + b)) return 3;
  // doc contains book title as a phrase ("Diary of a Wimpy Kid: The Getaway")
  if (a.includes(" " + b + " ")) return 2;
  // book contains doc title as a phrase ("Percy Jackson and the Lightning Thief" ⟵ "The Lightning Thief")
  if (b.includes(" " + a + " ") || b.endsWith(" " + a) || b.startsWith(a + " ")) {
    return 2;
  }
  return 0;
}

function authorMatches(docAuthors, bookAuthor) {
  if (!bookAuthor) return true;
  if (!docAuthors || !docAuthors.length) return true; // tolerate unknown
  // Token-based so "T. J. Klune" matches "TJ Klune" and
  // "Jerome K. Jerome" matches "Jerome Klapka Jerome".
  const bookNames = bookAuthor.split(/,\s*/);
  for (const bn of bookNames) {
    const bookTokens = normaliseStr(bn).split(/\s+/).filter((t) => t.length >= 2);
    if (!bookTokens.length) continue;
    for (const dn of docAuthors) {
      const docTokens = new Set(normaliseStr(dn).split(/\s+/).filter(Boolean));
      const hits = bookTokens.filter((t) => docTokens.has(t)).length;
      if (hits >= Math.min(2, bookTokens.length)) return true;
      if (hits >= 1 && bookTokens.length === 1) return true;
    }
  }
  return false;
}

// ISBN registration groups: 0/1 = English worldwide; 81/93 = English India.
// Sort ISBNs so we probe English editions on Amazon first — the OL doc
// usually mashes editions across languages into one ISBN list.
function isbnLangPriority(isbn) {
  if (isbn.startsWith("0") || isbn.startsWith("1")) return 0;
  if (isbn.startsWith("81") || isbn.startsWith("93") || isbn.startsWith("88")) return 1;
  return 2;
}

async function searchOpenLibrary(book) {
  const params = new URLSearchParams();
  const q = book.query || `${book.title} ${book.author ?? ""}`.trim();
  params.set("q", q);
  params.set(
    "fields",
    "cover_i,isbn,publish_year,title,author_name,language",
  );
  params.set("limit", "30");
  const url = "https://openlibrary.org/search.json?" + params.toString();
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await withTimeout(
        (signal) =>
          fetch(url, {
            signal,
            headers: { "User-Agent": "bookify-cover-builder/4.0" },
          }),
        TIMEOUT_MS,
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      return (data?.docs ?? []).map((d) => ({
        cover_i: d.cover_i,
        isbns: normaliseIsbns(d.isbn),
        year: Array.isArray(d.publish_year)
          ? Math.max(...d.publish_year.filter((y) => Number.isFinite(y)), 0)
          : 0,
        title: d.title,
        authors: d.author_name ?? [],
        langs: d.language ?? [],
      }));
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

function filterAndRank(docs, book) {
  const scored = docs
    .map((d) => ({ ...d, score: titleScore(d.title, book.title) }))
    .filter(
      (d) => d.score > 0 && authorMatches(d.authors, book.author),
    );
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.year - a.year;
  });
  return scored;
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
    if (len < 800 || !type.startsWith("image/jpeg")) return null;
    return url;
  } catch {
    return null;
  }
}

async function resolveCover(book) {
  const docs = await searchOpenLibrary(book);
  const ranked = filterAndRank(docs, book);
  if (!ranked.length) return null;

  // Pool ISBNs across all matching docs and sort by English-publisher priority.
  const seen = new Set();
  const probeList = [];
  for (const doc of ranked) {
    for (const isbn of doc.isbns) {
      if (seen.has(isbn)) continue;
      seen.add(isbn);
      probeList.push({ isbn, score: doc.score, year: doc.year });
    }
  }
  probeList.sort((a, b) => {
    const p = isbnLangPriority(a.isbn) - isbnLangPriority(b.isbn);
    if (p !== 0) return p;
    if (b.score !== a.score) return b.score - a.score;
    return b.year - a.year;
  });

  let probes = 0;
  for (const { isbn } of probeList) {
    if (probes >= MAX_ISBN_PROBES) break;
    probes++;
    const u = await amazonCoverIfReal(isbn);
    if (u) return u;
  }

  for (const doc of ranked) {
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
  const nulls = Object.entries(map).filter(([, v]) => !v).map(([k]) => k);
  if (nulls.length) {
    console.log("  unresolved:");
    nulls.forEach((k) => console.log("   -", k));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
