import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
  );
  console.log("tables:", tables.map((t) => t.tablename).join(", "));

  try {
    const mig = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
      'SELECT migration_name FROM _prisma_migrations ORDER BY migration_name'
    );
    console.log("migrations recorded:", mig.map((m) => m.migration_name).join(", "));
  } catch {
    console.log("migrations table: MISSING");
  }

  try {
    const counts = await prisma.$queryRawUnsafe<{ colleges: bigint; notices: bigint; users: bigint }[]>(
      'SELECT (SELECT count(*) FROM "College") colleges, (SELECT count(*) FROM "Notice") notices, (SELECT count(*) FROM "User") users'
    );
    console.log("legacy data:", JSON.stringify(counts[0], (_, v) => (typeof v === "bigint" ? Number(v) : v)));
  } catch (e: unknown) {
    console.log("legacy data: unavailable -", String((e as Error).message).split("\n")[0]);
  }

  await prisma.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("ERR", String((e as Error).message).split("\n")[0]);
  process.exit(1);
});
