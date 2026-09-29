-- CreateEnum
CREATE TYPE "CollegeTypeEnum" AS ENUM ('university', 'engineering', 'polytechnic', 'degree', 'diploma', 'medical', 'management', 'pharmacy', 'law', 'other');

-- CreateEnum
CREATE TYPE "OwnershipEnum" AS ENUM ('government', 'private', 'aided', 'deemed', 'autonomous');

-- CreateEnum
CREATE TYPE "NoticeTypeEnum" AS ENUM ('admission', 'registration', 'counselling', 'spot_round', 'vacant_seat', 'merit_list', 'waiting_list', 'fee_payment', 'reporting', 'extension', 'general');

-- CreateEnum
CREATE TYPE "EditorialStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('official', 'news', 'user_report', 'internal');

-- CreateEnum
CREATE TYPE "VerificationState" AS ENUM ('unverified', 'verified', 'deprecated');

-- CreateEnum
CREATE TYPE "DeadlineEvent" AS ENUM ('registration_open', 'registration_close', 'merit_list', 'choice_filling', 'seat_allotment', 'fee_payment', 'reporting', 'counselling_round', 'spot_round', 'result', 'classes_begin', 'other');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('college', 'offering', 'authority');

-- CreateEnum
CREATE TYPE "FeeComponent" AS ENUM ('tuition', 'hostel', 'exam', 'one_time', 'other');

-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('per_year', 'per_semester', 'total');

-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('diploma', 'undergraduate', 'postgraduate', 'doctoral');

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "kind" "SourceKind" NOT NULL DEFAULT 'official',
    "verification" "VerificationState" NOT NULL DEFAULT 'unverified',
    "lastCheckedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribution" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldPath" TEXT,
    "verifiedByAdmin" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "ProgramLevel" NOT NULL DEFAULT 'undergraduate',
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeSession" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CollegeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusFacility" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "hostel" BOOLEAN,

    CONSTRAINT "CampusFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffering" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "branchId" TEXT,
    "sessionYear" INTEGER NOT NULL,
    "durationYears" DOUBLE PRECISION,
    "durationLabel" TEXT,
    "totalSeats" INTEGER,
    "eligibility" TEXT,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "component" "FeeComponent" NOT NULL DEFAULT 'tuition',
    "amountPaise" INTEGER NOT NULL,
    "frequency" "FeeFrequency" NOT NULL DEFAULT 'per_year',
    "sessionYear" INTEGER NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntranceExam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conductingBody" TEXT,

    CONSTRAINT "EntranceExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounsellingAuthority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "state" TEXT,

    CONSTRAINT "CounsellingAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionRoute" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "examId" TEXT,
    "authorityId" TEXT,
    "eligibilityText" TEXT,
    "eligibilityStructured" JSONB,

    CONSTRAINT "AdmissionRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "collegeId" TEXT,
    "offeringId" TEXT,
    "authorityId" TEXT,
    "eventId" "DeadlineEvent" NOT NULL,
    "label" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "sessionId" INTEGER NOT NULL,
    "statusOverride" TEXT,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionNotice" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT,
    "authorityId" TEXT,
    "sessionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "type" "NoticeTypeEnum" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "officialUrl" TEXT,
    "pdfUrl" TEXT,
    "status" "EditorialStatus" NOT NULL DEFAULT 'published',
    "documentsRequired" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionNoticeDate" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionNoticeDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyTimelineStage" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "eventId" "DeadlineEvent" NOT NULL,
    "label" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "rawStageKey" TEXT NOT NULL,
    "rawStatus" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "LegacyTimelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_url_key" ON "Source"("name", "url");

-- CreateIndex
CREATE INDEX "Attribution_entityType_entityId_idx" ON "Attribution"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Attribution_sourceId_idx" ON "Attribution"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_year_key" ON "AcademicSession"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Program_name_key" ON "Program"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CollegeSession_collegeId_year_key" ON "CollegeSession"("collegeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "CampusFacility_collegeId_key" ON "CampusFacility"("collegeId");

-- CreateIndex
CREATE INDEX "CourseOffering_programId_idx" ON "CourseOffering"("programId");

-- CreateIndex
CREATE INDEX "CourseOffering_branchId_idx" ON "CourseOffering"("branchId");

-- CreateIndex
CREATE INDEX "CourseOffering_sessionYear_idx" ON "CourseOffering"("sessionYear");

-- CreateIndex
CREATE INDEX "CourseOffering_collegeId_idx" ON "CourseOffering"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_collegeId_programId_branchId_sessionYear_key" ON "CourseOffering"("collegeId", "programId", "branchId", "sessionYear");

-- CreateIndex
CREATE INDEX "FeeStructure_sessionYear_idx" ON "FeeStructure"("sessionYear");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_offeringId_component_sessionYear_key" ON "FeeStructure"("offeringId", "component", "sessionYear");

-- CreateIndex
CREATE UNIQUE INDEX "EntranceExam_name_key" ON "EntranceExam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CounsellingAuthority_name_key" ON "CounsellingAuthority"("name");

-- CreateIndex
CREATE INDEX "AdmissionRoute_examId_idx" ON "AdmissionRoute"("examId");

-- CreateIndex
CREATE INDEX "AdmissionRoute_authorityId_idx" ON "AdmissionRoute"("authorityId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionRoute_offeringId_examId_authorityId_key" ON "AdmissionRoute"("offeringId", "examId", "authorityId");

-- CreateIndex
CREATE INDEX "Deadline_scopeType_endsAt_idx" ON "Deadline"("scopeType", "endsAt");

-- CreateIndex
CREATE INDEX "Deadline_collegeId_idx" ON "Deadline"("collegeId");

-- CreateIndex
CREATE INDEX "Deadline_offeringId_idx" ON "Deadline"("offeringId");

-- CreateIndex
CREATE INDEX "Deadline_authorityId_idx" ON "Deadline"("authorityId");

-- CreateIndex
CREATE INDEX "AdmissionNotice_publishedAt_idx" ON "AdmissionNotice"("publishedAt");

-- CreateIndex
CREATE INDEX "AdmissionNotice_type_idx" ON "AdmissionNotice"("type");

-- CreateIndex
CREATE INDEX "AdmissionNotice_collegeId_idx" ON "AdmissionNotice"("collegeId");

-- CreateIndex
CREATE INDEX "AdmissionNoticeDate_noticeId_idx" ON "AdmissionNoticeDate"("noticeId");

-- CreateIndex
CREATE INDEX "AdmissionNoticeDate_date_idx" ON "AdmissionNoticeDate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyTimelineStage_collegeId_sortOrder_key" ON "LegacyTimelineStage"("collegeId", "sortOrder");

-- CreateIndex
CREATE INDEX "College_district_idx" ON "College"("district");

-- CreateIndex
CREATE INDEX "College_type_idx" ON "College"("type");

-- CreateIndex
CREATE INDEX "College_ownership_idx" ON "College"("ownership");

-- AddForeignKey
ALTER TABLE "Attribution" ADD CONSTRAINT "Attribution_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeSession" ADD CONSTRAINT "CollegeSession_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusFacility" ADD CONSTRAINT "CampusFacility_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_sessionYear_fkey" FOREIGN KEY ("sessionYear") REFERENCES "AcademicSession"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_sessionYear_fkey" FOREIGN KEY ("sessionYear") REFERENCES "AcademicSession"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionRoute" ADD CONSTRAINT "AdmissionRoute_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionRoute" ADD CONSTRAINT "AdmissionRoute_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionRoute" ADD CONSTRAINT "AdmissionRoute_examId_fkey" FOREIGN KEY ("examId") REFERENCES "EntranceExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionRoute" ADD CONSTRAINT "AdmissionRoute_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "CounsellingAuthority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "CounsellingAuthority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionNotice" ADD CONSTRAINT "AdmissionNotice_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionNotice" ADD CONSTRAINT "AdmissionNotice_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "CounsellingAuthority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionNotice" ADD CONSTRAINT "AdmissionNotice_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionNoticeDate" ADD CONSTRAINT "AdmissionNoticeDate_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "AdmissionNotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyTimelineStage" ADD CONSTRAINT "LegacyTimelineStage_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

