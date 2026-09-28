# AdmitFlow — Phase 0 Baseline Record

Recorded: 2026-09-28 · Branch: `master` · Pre-checkpoint HEAD: `df7b307`

## 1. Toolchain / build
| Item | Value |
|---|---|
| Node | v24.11.1 |
| Prisma CLI / Client | 6.19.3 / ^6.19.3 |
| Next.js | ^15.3.1 (App Router, React 19) |
| `npx prisma validate` | PASS (schema valid) |
| `npx prisma generate` | PASS |
| `npm run build` | PASS — 0 errors, 0 warnings (all routes compiled) |

## 2. Git state
- Working tree clean (only untracked: `.freebuff/` — tooling, intentionally NOT committed).
- Branch `master`, in sync with `origin/master`. 184 tracked files.
- No `.env*` file tracked; none has ever been committed
  (`git log --all --diff-filter=A -- "*.env*" ".env*"` → empty). Secrets not exposed in history.
- ⚠️ Hygiene flags (clean later): tracked `dev.db`, `prisma/dev.db`, `tsconfig.tsbuildinfo`.

## 3. Prisma / database configuration (unchanged, recorded)
- `schema.prisma`: `provider = "postgresql"`, `url = env("DATABASE_URL")`.
- `prisma/migrations/`: 2 migrations (init 2026-07-10, add_phone_otp).
- `.env` points to a Neon PostgreSQL database. Connectivity from this machine: **P1001
  unreachable at Phase 0 time** (network/endpoint availability). Phase 1 therefore runs
  offline (dry-run + SQL artifact); DB apply is scripted for when the endpoint is reachable.
- ⚠️ **Migration drift risk:** `vercel-build` runs `prisma db push --accept-data-loss`,
  bypassing `migrations/`. Phase 1 must standardize on `prisma migrate`.
- Existing models: User, UserSettings, Favorite, Download, Notification, PushSubscription,
  Admin, College, Notice, Post, Comment, BroadcastMessage, Visitor, AdminLog, Review, Suggestion.
- User-facing pages do NOT read College/Notice tables (all reads come from `src/data/*`).

## 4. src/data dataset counts (the live product data — hardcoded literals)
| Dataset | Count | Method |
|---|---|---|
| Colleges | **74** | `grep -c '^    id: "'` in `src/data/colleges.ts` (unique slugs verified) |
| Notices | **20** | `grep -c '^    id: "'` in `src/data/notices.ts` |
| Course rows | **228** | `grep -c '{ name: "'` in `src/data/colleges.ts` |
| Timelines (`collegeTimelines`) | **33** colleges | awk section count |
| Source-URL entries (`dataSources`) | **35** colleges | awk section count |
| Category buckets (`collegeCategories`) | 7 | — |

## 5. Referential integrity of the static dataset
- All **33** timeline keys resolve to an existing college id. ✔
- All notice `collegeId` values resolve to an existing college id. ✔
- `CollegeLogo` color map keys are stale (cosmetic only).
- Known data-quality facts carried forward (do NOT fix silently in migration):
  hardcoded notice statuses contradict dates; `pdfUrl` points to non-existent
  `/notices/*.pdf`; `admission.<domain>` portals are pattern-generated and unverified;
  "2026" notices contain 2025-cycle dates.

## 6. Phase 0 guarantees
- No source behavior modified in this phase (this doc + git metadata only).
- `src/data/*` remains the runtime source of truth for all user-facing pages.
- Rollback point: `df7b307` + this checkpoint commit.

## 7. Re-verification after any later phase
```
npx prisma validate && npm run build
```
Phase 1 migration report must reproduce: **74 colleges / 20 notices / 228 course rows /
33 timelines / 35 source-URL entries.**
