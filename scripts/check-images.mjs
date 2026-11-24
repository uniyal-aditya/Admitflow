import { existsSync } from "node:fs";
import { join } from "node:path";

const required = [
  "hero/hero-1.jpg", "hero/hero-2.jpg", "hero/hero-3.jpg", "hero/hero-4.jpg",
  "about/about.jpg",
  "colleges/doon-university.jpg", "colleges/gbpiet.jpg", "colleges/aiims-rishikesh.jpg",
  "colleges/uktech.jpg", "colleges/kumaun-university.jpg", "colleges/uou-haldwani.jpg",
];
const missing = required.filter((f) => !existsSync(join("public", "images", f)));
console.log(missing.length ? `Missing ${missing.length} of ${required.length}:\n - ${missing.join("\n - ")}` : "All required images are present.");
