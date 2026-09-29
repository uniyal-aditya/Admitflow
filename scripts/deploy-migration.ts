import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Load .env (strip CR for CRLF safety), extract DATABASE_URL
function loadDatabaseUrl(): string {
  const raw = readFileSync(".env", "utf8");
  const line = raw
    .split(/\r?\n/)
    .find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL not found in .env");
  let v = line.slice("DATABASE_URL=".length).trim();
  // strip surrounding quotes if present
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function canConnect(): Promise<boolean> {
  try {
    execSync("npx tsx scripts/db-state.ts", {
      stdio: "pipe",
      timeout: 60_000,
      env: { ...process.env },
    });
    return true;
  } catch {
    return false;
  }
}

async function deployWithRetry(): Promise<void> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[deploy] attempt ${attempt}/${MAX_ATTEMPTS}...`);
    try {
      execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        timeout: 120_000,
      });
      console.log("[deploy] SUCCESS on attempt", attempt);
      return;
    } catch (err) {
      const msg = String(err);
      if (msg.includes("P1001") || msg.includes("Can't reach database server")) {
        console.log(`[deploy] P1001 (Neon flake) on attempt ${attempt}, waiting 5s...`);
        await sleep(5000);
        continue;
      }
      // Non-transient error: rethrow
      throw err;
    }
  }
  throw new Error(`[deploy] failed after ${MAX_ATTEMPTS} attempts`);
}

async function main() {
  const url = loadDatabaseUrl();
  if (!url) throw new Error("empty DATABASE_URL");
  console.log("[deploy] DATABASE_URL host:", new URL(url).host);

  // Pre-check connectivity
  if (!(await canConnect())) {
    console.log("[deploy] DB unreachable, retrying after 5s...");
    await sleep(5000);
    if (!(await canConnect())) {
      throw new Error("DB unreachable even after retry; aborting deploy");
    }
  }
  console.log("[deploy] DB reachable, deploying...");

  await deployWithRetry();

  // Post-deploy verification
  console.log("[deploy] verifying...");
  execSync("npx tsx scripts/db-state.ts", { stdio: "inherit", timeout: 60_000 });
  console.log("[deploy] done.");
}

main().catch((e) => {
  console.error("[deploy] FATAL:", String(e).split("\n").slice(0, 5).join("\n"));
  process.exit(1);
});
