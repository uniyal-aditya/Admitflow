-- Phase 5: canonical notice model — legacy AI-era Notice table removed.
--
-- Order matters:
-- 1. Drop legacy "Notice" first (nothing references it; its FK to College
--    cascades away with the table). This is the AI-era table; its aiSummary
--    column dies with the table. Its data was already mirrored 1:1 into the
--    canonical AdmissionNotice table by the Phase 1 seeder, so no data moves.
-- 2. Drop deprecated College columns (legacy pattern-generated
--    admissionPortal + the courses JSON blob superseded by CourseOffering).
-- 3. Rename canonical tables AdmissionNotice → Notice and
--    AdmissionNoticeDate → NoticeDate. Postgres renames the pkey constraint
--    and column defaults automatically; FK constraints and indexes keep
--    their table-embedded names, so those are renamed explicitly.
--
-- Table data is preserved 1:1; only names and dead objects change.

-- 1. Legacy AI-era notice table (cascade-drops its own FK + indexes).
DROP TABLE IF EXISTS "Notice";

-- 2. Deprecated College columns (admissionPortal was pattern-generated and
--    never copied into the canonical domain; courses JSON is superseded by
--    CourseOffering rows).
ALTER TABLE "College" DROP COLUMN IF EXISTS "admissionPortal";
ALTER TABLE "College" DROP COLUMN IF EXISTS "courses";

-- 3a. Rename canonical tables.
ALTER TABLE "AdmissionNotice" RENAME TO "Notice";
ALTER TABLE "AdmissionNoticeDate" RENAME TO "NoticeDate";

-- 3b. FK constraints (names embed the old table name).
ALTER TABLE "Notice" RENAME CONSTRAINT "AdmissionNotice_collegeId_fkey" TO "Notice_collegeId_fkey";
ALTER TABLE "Notice" RENAME CONSTRAINT "AdmissionNotice_authorityId_fkey" TO "Notice_authorityId_fkey";
ALTER TABLE "Notice" RENAME CONSTRAINT "AdmissionNotice_sessionId_fkey" TO "Notice_sessionId_fkey";
ALTER TABLE "NoticeDate" RENAME CONSTRAINT "AdmissionNoticeDate_noticeId_fkey" TO "NoticeDate_noticeId_fkey";

-- 3c. Indexes (names embed the old table name).
ALTER INDEX "AdmissionNotice_publishedAt_idx" RENAME TO "Notice_publishedAt_idx";
ALTER INDEX "AdmissionNotice_type_idx" RENAME TO "Notice_type_idx";
ALTER INDEX "AdmissionNotice_collegeId_idx" RENAME TO "Notice_collegeId_idx";
ALTER INDEX "AdmissionNoticeDate_noticeId_idx" RENAME TO "NoticeDate_noticeId_idx";
ALTER INDEX "AdmissionNoticeDate_date_idx" RENAME TO "NoticeDate_date_idx";

-- 4. Provenance bookkeeping: attribution rows that pointed at the canonical
--    table by its old name are relabeled (entityType + the table-embedded id
--    template), so the idempotent seeder's new `Notice:...` rows conflict-
--    skip instead of duplicating. Notice ids are slugs (no colons), so
--    split_part safely extracts the entityId.
UPDATE "Attribution"
   SET "entityType" = 'Notice',
       "id" = 'Notice:' || substring("id" from 17)  -- strip 'AdmissionNotice:' (16 chars)
 WHERE "id" LIKE 'AdmissionNotice:%';
