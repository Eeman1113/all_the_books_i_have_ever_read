#!/usr/bin/env node
// Downloads every book cover from the user's canonical ISBN list into
// public/covers/<slug>.jpg, then writes src/app/covers.json with relative
// URLs (`covers/<slug>.jpg`). Relative URLs work in both dev (basePath
// empty) and prod (basePath /all_the_books_i_have_ever_read) because
// they resolve against the current page URL.
//
// Tries Amazon's image CDN first; falls back to m.media-amazon, then
// OpenLibrary's b/isbn endpoint. Skips Partypooper (unpublished).
// Run: node scripts/download-all-covers.mjs

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BOOKS_PATH = resolve(ROOT, "src/app/books.ts");
const OUT_JSON = resolve(ROOT, "src/app/covers.json");
const COVERS_DIR = resolve(ROOT, "public/covers");

// title -> ISBN-13. Canonical, user-supplied. N/A entries are noted in
// SPECIAL below.
const ISBN13 = {
  "Swami and Friends": "9788185986005",
  "One Indian Girl": "9788129142146",
  "Great Expectations": "9780141439563",
  "Revolution 2020": "9788129118806",
  "The Girl in Room 105": "9781477461520",
  "One Arranged Murder": "9781542031495",
  "Half Girlfriend": "9788129135728",
  "A Study in Scarlet": "9780140439082",
  "The Sign of Four": "9780140439075",
  "The Adventures of Sherlock Holmes": "9780451528361",
  "The Memoirs of Sherlock Holmes": "9780140437712",
  "The Hound of the Baskervilles": "9780451528019",
  "The Return of Sherlock Holmes": "9780140437729",
  "His Last Bow": "9780140437736",
  "The Case-Book of Sherlock Holmes": "9780140437743",
  "And Then There Were None": "9780062073488",
  "Death on the Nile": "9780062073556",
  "Oliver Twist": "9780141439747",
  "Diary of a Wimpy Kid": "9780810993136",
  "Rodrick Rules": "9780810994737",
  "The Last Straw": "9780810970687",
  "Dog Days": "9780810983915",
  "The Ugly Truth": "9780810984912",
  "Cabin Fever": "9781419702235",
  "The Third Wheel": "9781419705847",
  "Hard Luck": "9781419711329",
  "The Long Haul": "9781419711893",
  "Old School": "9781419717017",
  "Double Down": "9781419723445",
  "The Getaway": "9781419725456",
  "The Meltdown": "9781419727436",
  "Wrecking Ball": "9781419739033",
  "The Deep End": "9781419748684",
  "Big Shot": "9781419749155",
  "Diper Överlöde": "9781419762949",
  "No Brainer": "9781419766947",
  "Hot Mess": "9781419776267",
  "Tom Gates Series": "9781407193434",
  "The Hunger Games": "9780439023481",
  "Catching Fire": "9780439023498",
  "Mockingjay": "9780439023511",
  "Verity": "9781538724736",
  "Bride": "9780593550403",
  "The Love Hypothesis": "9780593336823",
  "It Ends With Us": "9781501110368",
  "The Forty Rules of Love": "9780143118527",
  "Twilight": "9780316015844",
  "New Moon": "9780316024969",
  "Eclipse": "9780316160209",
  "Breaking Dawn": "9780316067928",
  "1984": "9780451524935",
  "The Alchemist": "9780062315007",
  "Days at the Morisaki Bookshop": "9780063278677",
  "More Days at the Morisaki Bookshop": "9780063380295",
  "A Good Girl's Guide to Murder": "9781984896391",
  "Shatter Me": "9780062085504",
  "Gone Girl": "9780307588371",
  "Percy Jackson and the Lightning Thief": "9780786838653",
  "The Sea of Monsters": "9781423103349",
  "The Titan's Curse": "9781423101482",
  "The Battle of the Labyrinth": "9781423101499",
  "The Last Olympian": "9781423101505",
  "Sandworm": "9780385544405",
  "Turtles All the Way Down": "9780525555360",
  "Murder on the Orient Express": "9780062073501",
  "The House in the Cerulean Sea": "9781250217318",
  "Somewhere Beyond the Sea": "9781250893796",
  "Romeo and Juliet": "9780743477116",
  "Legends & Lattes": "9781250886088",
  "Babel": "9780063020426",
  "Strange Houses": "9781408731550",
  "Strange Buildings": "9784569852230",
  "Etee Tomar Maa": "9788176123440",
  Mahagatha: "9789354894228",
  "A Man Called Ove": "9781476738024",
  "Project Hail Mary": "9780593135204",
  "Dungeon Crawler Carl": "9780593855522",
  "Gulliver's Travels": "9780141439495",
  "Three Men in a Boat": "9780140437507",
  "Around the World in Eighty Days": "9780140449068",
  "Harry Potter and the Philosopher's Stone": "9780747532743",
  "Harry Potter and the Chamber of Secrets": "9780747538486",
  "Harry Potter and the Prisoner of Azkaban": "9780747546290",
  "Harry Potter and the Goblet of Fire": "9780747546245",
  "Harry Potter and the Order of the Phoenix": "9780747551003",
  "Harry Potter and the Half-Blood Prince": "9780747581086",
  "Harry Potter and the Deathly Hallows": "9780545010221",
  "The Metamorphosis": "9780553213690",
  "White Nights": "9780140447323",
  "Co-Intelligence": "9780593716717",
  Mahabharata: "9788172763688",
  "Tomorrow, and Tomorrow, and Tomorrow": "9780593321201",
  Maus: "9780394868266",
  Sapiens: "9780062316097",
  "Black Beauty": "9780141321035",
  "Harry Potter and the Cursed Child": "9781338099133",
  Butter: "9780063283282",
  "A Brief History of Time": "9780553380163",
  "The Universe in a Nutshell": "9780553802023",
  "Journey to the Center of the Earth": "9780140449419",
};

// Skip / use existing files for these:
const SPECIAL = {
  Partypooper: null, // unpublished
  // 12 Years is an Audible Original — no print edition; use prior Amazon
  // discovery for the audiobook cover (already verified live).
  "12 Years My Messed-Up Love Story": {
    url: "https://images-na.ssl-images-amazon.com/images/P/9369896872.01.LZZZZZZZ.jpg",
  },
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

async function fetchBuf(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "bookify-downloader/1.0" },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return null;
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    if (buf.length < 800) return null; // amazon placeholder gif
    return { buf, type };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extOf(contentType, buf) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  // JPEG default — also magic-byte sniff just in case
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  return "jpg";
}

async function attemptDownload(book, isbn13, slugName) {
  const isbn10 = isbn13 ? isbn13to10(isbn13) : null;
  const candidates = [];
  if (isbn10) {
    candidates.push(
      `https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`,
      `https://m.media-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`,
    );
  }
  if (isbn13) {
    candidates.push(
      `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`,
    );
  }
  const special = SPECIAL[book.title];
  if (special?.url) candidates.unshift(special.url);
  if (book.coverUrl) candidates.push(book.coverUrl);

  for (const url of candidates) {
    const got = await fetchBuf(url);
    if (!got) continue;
    const ext = extOf(got.type, got.buf);
    const filename = `${slugName}.${ext}`;
    await writeFile(resolve(COVERS_DIR, filename), got.buf);
    return { filename, source: url };
  }
  return null;
}

async function existingFile(slugName) {
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    try {
      await stat(resolve(COVERS_DIR, `${slugName}.${ext}`));
      return `${slugName}.${ext}`;
    } catch {}
  }
  return null;
}

async function main() {
  await mkdir(COVERS_DIR, { recursive: true });
  const src = await readFile(BOOKS_PATH, "utf8");
  const books = parseBooks(src);

  const out = {};
  let amazon = 0;
  let ol = 0;
  let kept = 0;
  let skip = 0;
  let missing = 0;

  let i = 0;
  for (const book of books) {
    i++;
    const key = `${book.title}|${book.author ?? ""}`;
    const slugName = slug(book.title);

    if (book.title in SPECIAL && SPECIAL[book.title] === null) {
      out[key] = null;
      skip++;
      process.stdout.write(`\r  ${i}/${books.length} skip ${book.title}\n`);
      continue;
    }

    const existing = await existingFile(slugName);
    const isbn13 = ISBN13[book.title];

    // If we already have a file AND the user didn't provide a new ISBN,
    // keep what's on disk.
    if (existing && !isbn13 && !SPECIAL[book.title]?.url) {
      out[key] = `covers/${existing}`;
      kept++;
      process.stdout.write(`\r  ${i}/${books.length} kept ${book.title}\n`);
      continue;
    }

    const got = await attemptDownload(book, isbn13, slugName);
    if (got) {
      out[key] = `covers/${got.filename}`;
      if (got.source.includes("amazon")) amazon++;
      else if (got.source.includes("openlibrary")) ol++;
      else kept++;
      process.stdout.write(
        `\r  ${i}/${books.length} ok   ${book.title}\n`,
      );
    } else if (existing) {
      out[key] = `covers/${existing}`;
      kept++;
      process.stdout.write(
        `\r  ${i}/${books.length} kept ${book.title} (download failed)\n`,
      );
    } else {
      out[key] = null;
      missing++;
      process.stdout.write(
        `\r  ${i}/${books.length} miss ${book.title}\n`,
      );
    }
  }

  await writeFile(OUT_JSON, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `\n✓ ${amazon} amazon · ${ol} openlibrary · ${kept} existing · ${skip} skipped · ${missing} missing`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
