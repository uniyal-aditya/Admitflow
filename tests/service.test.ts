import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import {
  getNotices,
  getNoticeById,
  getTimeline,
  getCollegeDetail,
  noticeRowToViewModel,
} from "@/lib/services/admission";
import { deriveNoticeStatus } from "@/lib/services/deadline";

// Service-layer integration tests against the real (Neon) database.
// These exercise the seeder-loaded canonical dataset. Assertions on shared
// data are count/shape-level; mutations are confined to test-prefixed ids
// and always cleaned up.

describe("admission service / dataset", () => {
  it("loads the full notice dataset with engine-derived statuses", async () => {
    const notices = await getNotices();
    assert.ok(notices.length >= 20, `expected >= 20 notices, got ${notices.length}`);
    for (const n of notices) {
      assert.ok(["active", "upcoming", "expired"].includes(n.status), `bad status on ${n.id}`);
      // Engine parity: stored status matches fresh derivation.
      assert.equal(n.status, deriveNoticeStatus(n.publishedDate, n.lastDate));
    }
  });

  it("resolves college short names on notices", async () => {
    const notices = await getNotices();
    for (const n of notices) {
      if (n.collegeId) {
        assert.ok(n.collegeShortName, `missing collegeShortName on ${n.id}`);
      }
    }
  });

  it("fetches a single notice by id and 404s cleanly on unknown ids", async () => {
    const notice = await getNoticeById("uktech-merit-2026");
    assert.ok(notice, "seeded notice should exist");
    assert.equal(notice!.id, "uktech-merit-2026");
    assert.equal(await getNoticeById("does-not-exist-xyz"), null);
  });

  it("derives timeline stage statuses from dates", async () => {
    const timeline = await getTimeline("uktech");
    assert.ok(timeline, "uktech has seeded timeline stages");
    assert.ok(timeline!.stages.length > 0);
    const today = new Date();
    for (const s of timeline!.stages) {
      if (s.status !== "current" && s.date) {
        const d = new Date(s.date);
        if (d < today) assert.equal(s.status, "completed", `past stage ${s.stage} not completed`);
      }
    }
  });

  it("assembles the full college detail payload", async () => {
    const detail = await getCollegeDetail("uktech");
    assert.ok(detail);
    assert.equal(detail!.college.id, "uktech");
    assert.ok(detail!.college.courses.length > 0, "courses reconstructed from offerings");
    assert.ok(Array.isArray(detail!.notices));
  });

  it("notice view-model derives lastDate from structured deadline dates", () => {
    const future = new Date(Date.now() + 86400000);
    const past = new Date(Date.now() - 86400000);
    const vm = noticeRowToViewModel({
      id: "t1",
      collegeId: "c1",
      title: "T",
      type: "admission",
      publishedAt: new Date("2026-01-01"),
      summary: null,
      pdfUrl: null,
      officialUrl: null,
      documentsRequired: [],
      dates: [
        { kind: "deadline", label: "First", date: past },
        { kind: "deadline", label: "Second", date: future },
        { kind: "important_date", label: "Info", date: future },
      ],
    });
    // lastDate = latest deadline date
    assert.equal(vm.lastDate, future.toISOString().slice(0, 10));
    assert.equal(vm.deadlines.length, 2);
    assert.equal(vm.importantDates.length, 1);
  });
});

describe("admin write path invariants (canonical model)", () => {
  const TEST_ID = "_phase9-test-notice";

  after(async () => {
    await prisma.noticeDate.deleteMany({ where: { noticeId: TEST_ID } });
    await prisma.notice.deleteMany({ where: { id: TEST_ID } });
    await prisma.$disconnect();
  });

  it("creates a canonical notice with structured dates and deletes cleanly", async () => {
    const uktech = await prisma.college.findUnique({ where: { id: "uktech" }, select: { id: true } });
    assert.ok(uktech, "uktech must exist");

    const created = await prisma.notice.create({
      data: {
        id: TEST_ID,
        collegeId: uktech!.id,
        sessionId: 2026,
        title: "Phase 9 Test",
        type: "general",
        publishedAt: new Date("2026-09-01"),
        documentsRequired: [],
        dates: {
          create: [
            { kind: "deadline", label: "Last Date", date: new Date("2027-01-01") },
            { kind: "important_date", label: "Info", date: new Date("2026-10-01") },
          ],
        },
      },
      include: { dates: true },
    });
    assert.equal(created.dates.length, 2);

    // Duplicate id must conflict (the API maps this to 409).
    await assert.rejects(
      () =>
        prisma.notice.create({
          data: { id: TEST_ID, collegeId: uktech!.id, sessionId: 2026, title: "Dup", type: "general" },
        }),
      (e: unknown) => (e as { code?: string }).code === "P2002",
    );

    // Deleting the notice cascades its dates.
    await prisma.notice.delete({ where: { id: TEST_ID } });
    const orphanDates = await prisma.noticeDate.count({ where: { noticeId: TEST_ID } });
    assert.equal(orphanDates, 0);
  });
});
