#!/usr/bin/env node
// Re-download cover images using OpenLibrary search by title + author,
// which returns the actual book regardless of which edition's ISBN we guess.
// Writes JPG to public/covers/<slug>.jpg and updates src/app/covers.json.
//
// Manual overrides (books OL doesn't carry well or where we know a better
// cover) live in MANUAL_OVERRIDES below — those will be downloaded from
// the explicit URL and trusted.
//
// Run: node scripts/redownload-via-ol.mjs [--only "Book Title"]

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BOOKS_PATH = resolve(ROOT, "src/app/books.ts");
const OUT_JSON = resolve(ROOT, "src/app/covers.json");
const COVERS_DIR = resolve(ROOT, "public/covers");

const ONLY = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

// Books where the search would miss or where we want a specific edition.
// Each value is a URL to download.
const MANUAL_OVERRIDES = {
  // User-uploaded sketch for Etee Tomar Maa
  "Etee Tomar Maa":
    "https://cdn.jsdelivr.net/gh/Eeman1113/all_the_books_i_have_ever_read@main/public/covers/etee-tomar-maa.webp",
  // Co-Intelligence — Penguin Random House CDN
  "Co-Intelligence":
    "https://images.penguinrandomhouse.com/cover/9780593716717",
  // 12 Years — Audible Original, prior Amazon discovery
  "12 Years My Messed-Up Love Story":
    "https://images-na.ssl-images-amazon.com/images/P/9369896872.01.LZZZZZZZ.jpg",
};

// Books where the title search needs help.
const SEARCH_OVERRIDES = {
  "Tom Gates Series": "Tom Gates Everything's Amazing Liz Pichon",
  "Strange Houses": "Strange Houses Uketsu",
  "Strange Buildings": "Strange Pictures Uketsu",
  Partypooper: null, // unpublished
};

function isbn13to10(isbn13) {
  if (isbn13.length !== 13 || !isbn13.startsWith("978")) return null;
  const base = isbn13.substring(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(base[i], 10) * (10 - i);
  const c = (11 - (sum % 11)) % 11;
  return base + (c === 10 ? "X" : String(c));
}

function slug(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBooks(src) {
  const blocks = src.match(/\{\s*title:[\s\S]*?\},/g) ?? [];
  return blocks.map((block) => {
    const get = (name) =>
      block.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    return {
      title: get("title"),
      author: get("author"),
      coverUrl: get("coverUrl"),
    };
  });
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

const REJECT_RE =
  /\b(trilogy|series|collection|complete|box ?set|boxset|combo|graphic novel|sparknotes|study guide|summary of|workbook on|trivia|companion to|guide to|cliffsnotes)\b/i;

function titleMatchesBook(docTitle, bookTitle) {
  if (REJECT_RE.test(docTitle)) return 0;
  const a = normaliseStr(docTitle);
  const b = normaliseStr(bookTitle);
  if (!a || !b) return 0;
  if (a === b) return 4;
  if (a.startsWith(b + " ")) return 3;
  if (a.endsWith(" " + b)) return 3;
  if (a.includes(" " + b + " ")) return 2;
  if (b.includes(" " + a + " ") || b.endsWith(" " + a) || b.startsWith(a + " ")) return 2;
  return 0;
}

function authorMatchesBook(docAuthors, bookAuthor) {
  if (!bookAuthor) return true;
  if (!docAuthors || !docAuthors.length) return true;
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

async function searchOL(query) {
  const url =
    "https://openlibrary.org/search.json?q=" +
    encodeURIComponent(query) +
    "&fields=cover_i,isbn,publish_year,title,author_name,language&limit=25";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "bookify-redownload/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.docs ?? [];
  } catch {
    return [];
  }
}

async function downloadBytes(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1500) return null; // OL placeholder is tiny, Amazon is 43B
    return { buf, type };
  } catch {
    return null;
  }
}

function extOf(type, buf) {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  return "jpg";
}

async function resolveCoverUrl(book) {
  // 1. Manual override wins
  if (MANUAL_OVERRIDES[book.title]) return MANUAL_OVERRIDES[book.title];
  // 2. Existing book.coverUrl (kept after the older runs — preserves Etee, etc.)
  if (book.coverUrl) {
    /* but only use as fallback below */
  }
  const query =
    SEARCH_OVERRIDES[book.title] === null
      ? null
      : SEARCH_OVERRIDES[book.title] ||
        `${book.title} ${book.author ?? ""}`.trim();
  if (!query) return null;

  // 3. OpenLibrary search → ranked docs
  const docs = await searchOL(query);
  const scored = docs
    .map((d) => ({
      score: titleMatchesBook(d.title, book.title),
      authorOk: authorMatchesBook(d.author_name, book.author),
      cover_i: d.cover_i,
      isbns: (d.isbn || []).map((s) => String(s).replace(/[-\s]/g, "")),
      year: Array.isArray(d.publish_year)
        ? Math.max(...d.publish_year.filter((y) => Number.isFinite(y)), 0)
        : 0,
      title: d.title,
    }))
    .filter((d) => d.score > 0 && d.authorOk)
    .sort((a, b) => b.score - a.score || b.year - a.year);

  // 4. For each ranked doc, try its OL cover_i first (real cover for this book),
  //    then Amazon by ISBN-10 in registration order.
  for (const doc of scored) {
    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }
  }
  // 5. Some docs have ISBNs but no cover_i — try OL by ISBN endpoint
  for (const doc of scored) {
    for (const isbn of doc.isbns) {
      let isbn13 = isbn.length === 13 ? isbn : null;
      if (isbn.length === 10) isbn13 = "978" + isbn.substring(0, 9); // not exact but covers/b/isbn accepts both
      if (isbn13) {
        return `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`;
      }
    }
  }
  // 6. Last resort: existing coverUrl
  if (book.coverUrl) return book.coverUrl;
  return null;
}

async function main() {
  await mkdir(COVERS_DIR, { recursive: true });
  const src = await readFile(BOOKS_PATH, "utf8");
  const books = parseBooks(src);

  let map = {};
  try {
    map = JSON.parse(await readFile(OUT_JSON, "utf8"));
  } catch {}

  let ok = 0;
  let fail = 0;
  let i = 0;
  for (const book of books) {
    i++;
    if (ONLY && book.title !== ONLY) continue;
    const key = `${book.title}|${book.author ?? ""}`;
    const slugName = slug(book.title);

    if (SEARCH_OVERRIDES[book.title] === null) {
      map[key] = null;
      process.stdout.write(`\r  ${i}/${books.length} skip ${book.title}\n`);
      continue;
    }

    const url = await resolveCoverUrl(book);
    if (!url) {
      process.stdout.write(`\r  ${i}/${books.length} ??   ${book.title}\n`);
      fail++;
      continue;
    }
    const got = await downloadBytes(url);
    if (!got) {
      process.stdout.write(
        `\r  ${i}/${books.length} miss ${book.title} (${url})\n`,
      );
      fail++;
      continue;
    }
    const ext = extOf(got.type, got.buf);
    const filename = `${slugName}.${ext}`;
    await writeFile(resolve(COVERS_DIR, filename), got.buf);
    map[key] = `covers/${filename}`;
    process.stdout.write(
      `\r  ${i}/${books.length} ok   ${book.title}  (${url.slice(0, 80)})\n`,
    );
    ok++;
  }
  await writeFile(OUT_JSON, JSON.stringify(map, null, 2) + "\n");
  console.log(`\n✓ ${ok} ok · ${fail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
