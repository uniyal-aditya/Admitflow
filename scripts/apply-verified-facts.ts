/**
 * Loads the Phase 3 research (src/data/verified-facts.ts) into the database.
 *  - Creates the new colleges (never overwrites an existing college row).
 *  - Applies the listed corrections to existing colleges.
 *  - Records every fact as a Source + Attribution that is NOT yet confirmed.
 *    An admin confirms each one in Admin > Verification.
 * Idempotent. Usage: npx tsx scripts/apply-verified-facts.ts [--dry-run]
 */
import { PrismaClient } from "@prisma/client";
import { researched, corrections, RESEARCH_DATE } from "../src/data/verified-facts";

const DRY = process.argv.includes("--dry-run");

async function main() {
  const prisma = new PrismaClient();
  const log = (m: string) => console.log(DRY ? `[dry-run] ${m}` : m);

  for (const r of researched) {
    if (r.create) {
      const exists = await prisma.college.findUnique({ where: { id: r.id }, select: { id: true } });
      if (exists) log(`college ${r.id}: already exists, left unchanged`);
      else {
        log(`college ${r.id}: create`);
        if (!DRY) await prisma.college.create({ data: { ...r.create } });
      }
    }
  }

  for (const c of corrections) {
    const row = await prisma.college.findUnique({ where: { id: c.collegeId } });
    if (!row) { log(`correction skipped, ${c.collegeId} not found`); continue; }
    const current = (row as unknown as Record<string, unknown>)[c.field];
    if (current !== c.from) { log(`correction ${c.collegeId}.${c.field}: current value differs from expected, skipped`); continue; }
    log(`correction ${c.collegeId}.${c.field}: "${c.from}" -> ${c.to === null ? "empty" : `"${c.to}"`}`);
    if (!DRY) await prisma.college.update({ where: { id: c.collegeId }, data: { [c.field]: c.to } });
  }

  for (const r of researched) {
    for (const f of r.facts) {
      for (const s of f.sources) {
        log(`attribution ${r.id}.${f.field} <- ${s.name}`);
        if (DRY) continue;
        let source = await prisma.source.findFirst({ where: { name: s.name, url: s.url } });
        if (!source) {
          source = await prisma.source.create({
            data: { name: s.name, url: s.url, kind: "official", verification: "unverified", notes: `Researched ${RESEARCH_DATE}; awaiting admin confirmation.` },
          });
        }
        const id = `College:${r.id}:${f.field}:${source.id}`;
        await prisma.attribution.upsert({
          where: { id },
          update: {},
          create: { id, sourceId: source.id, entityType: "College", entityId: r.id, fieldPath: f.field },
        });
      }
    }
  }
  await prisma.$disconnect();
  console.log(DRY ? "Dry run complete. Nothing was written." : "Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
