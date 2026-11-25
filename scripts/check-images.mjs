// Checks public/images against the files the site expects, and explains any mismatch.
// Usage: node scripts/check-images.mjs
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";

const ROOT = join("public", "images");
const required = [
  "hero/hero-1", "hero/hero-2", "hero/hero-3", "hero/hero-4",
  "about/about",
  "colleges/doon-university", "colleges/gbpiet", "colleges/aiims-rishikesh",
  "colleges/uktech", "colleges/kumaun-university", "colleges/uou-haldwani",
];
const GOOD = [".jpg", ".jpeg", ".png", ".webp"];

if (!existsSync(ROOT)) {
  console.log(`The folder "${ROOT}" does not exist.\nCreate it inside your project's "public" folder, then add hero/, about/ and colleges/ folders.`);
  process.exit(1);
}

function list(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile()) : [];
}

let ok = 0;
const problems = [];
for (const rel of required) {
  const dir = join(ROOT, dirname(rel));
  const stem = basename(rel);
  const files = list(dir);
  const exact = files.find((f) => f === `${stem}.jpg`);
  if (exact) { ok++; continue; }
  const sameName = files.find((f) => f.toLowerCase().startsWith(stem.toLowerCase() + ".") );
  if (sameName) {
    const ext = extname(sameName);
    if (GOOD.includes(ext) && sameName.slice(0, -ext.length) === stem) { ok++; console.log(`OK (works): ${rel}${ext}`); }
    else problems.push(`Found "${join(dirname(rel), sameName)}". It works only if the name is exactly "${stem}" with a .jpg, .jpeg, .png or .webp extension. Rename it.`);
  } else {
    const similar = files.filter((f) => f.toLowerCase().includes(stem.toLowerCase().replace(/-/g, "")) || f.toLowerCase().includes(stem.toLowerCase()));
    problems.push(`Missing: ${rel}.jpg${similar.length ? `  (similar file found: ${similar.join(", ")})` : ""}`);
  }
}

// File problems that make a photo load as a broken image.
for (const sub of ["hero", "about", "colleges"]) {
  for (const f of list(join(ROOT, sub))) {
    const size = statSync(join(ROOT, sub, f)).size;
    const ext = extname(f).toLowerCase();
    if ([".heic", ".heif", ".jfif", ".tif", ".tiff", ".bmp"].includes(ext)) problems.push(`${sub}/${f} is a ${ext} file. Browsers cannot show it. Convert it to .jpg.`);
    if (size === 0) problems.push(`${sub}/${f} is empty (0 bytes). Copy it again.`);
    if (size > 800 * 1024) problems.push(`${sub}/${f} is ${Math.round(size / 1024)} KB. Compress it to about 300 KB or less.`);
  }
}

console.log(`\n${ok} of ${required.length} required images are in place.`);
if (problems.length) console.log("\nTo fix:\n - " + problems.join("\n - "));
