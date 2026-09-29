import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveNoticeStatus,
  deriveTimelineStages,
  deriveCurrentStage,
} from "@/lib/services/deadline";

// The deadline engine is a pure function of (rows, now) — no DB, no clock
// dependence: `now` is injected so tests are deterministic.

const NOW = new Date("2026-09-29T12:00:00Z");
const PAST = "2026-01-01";
const FUTURE = "2027-01-01";

describe("deriveNoticeStatus", () => {
  it("expired when deadline has passed", () => {
    assert.equal(deriveNoticeStatus(PAST, PAST, NOW), "expired");
  });

  it("active when deadline is in the future", () => {
    assert.equal(deriveNoticeStatus(PAST, FUTURE, NOW), "active");
  });

  it("upcoming when published in the future", () => {
    assert.equal(deriveNoticeStatus(FUTURE, null, NOW), "upcoming");
  });

  it("active when no dates exist (missing dates never constrain)", () => {
    assert.equal(deriveNoticeStatus(null, null, NOW), "active");
  });

  it("future publish date wins → upcoming even with a future deadline", () => {
    // Deadline only drives expiry; a not-yet-published notice is upcoming.
    assert.equal(deriveNoticeStatus(FUTURE, FUTURE, NOW), "upcoming");
  });

  it("deadline beats publish date: past deadline + future publish → expired", () => {
    assert.equal(deriveNoticeStatus(FUTURE, PAST, NOW), "expired");
  });

  it("treats empty strings as missing dates", () => {
    assert.equal(deriveNoticeStatus("", "", NOW), "active");
    assert.equal(deriveNoticeStatus(PAST, "", NOW), "active");
  });

  it("treats unparseable dates as missing", () => {
    assert.equal(deriveNoticeStatus("not-a-date", PAST, NOW), "expired");
  });

  it("expiry boundary: deadline strictly before now", () => {
    const before = new Date(NOW.getTime() - 1);
    const after = new Date(NOW.getTime() + 1);
    assert.equal(deriveNoticeStatus(PAST, before, NOW), "expired");
    assert.equal(deriveNoticeStatus(PAST, after, NOW), "active");
  });
});

describe("deriveTimelineStages", () => {
  it("marks past stages completed regardless of raw status", () => {
    const stages = deriveTimelineStages(
      [{ stage: "registration", label: "R", date: PAST, status: "upcoming" }],
      NOW,
    );
    assert.equal(stages[0].status, "completed");
  });

  it("future stages keep their raw status", () => {
    const stages = deriveTimelineStages(
      [{ stage: "spot_round", label: "S", date: FUTURE, status: "upcoming" }],
      NOW,
    );
    assert.equal(stages[0].status, "upcoming");
  });

  it("dataset 'current' override wins even when the date has passed", () => {
    const stages = deriveTimelineStages(
      [{ stage: "counselling_1", label: "C", date: PAST, status: "current" }],
      NOW,
    );
    assert.equal(stages[0].status, "current");
  });

  it("dataset 'completed' marker stays completed for future dates", () => {
    const stages = deriveTimelineStages(
      [{ stage: "closed", label: "X", date: FUTURE, status: "completed" }],
      NOW,
    );
    assert.equal(stages[0].status, "completed");
  });

  it("stages without dates pass through untouched", () => {
    const stages = deriveTimelineStages(
      [{ stage: "waiting_list", label: "W", status: "upcoming" }],
      NOW,
    );
    assert.equal(stages[0].status, "upcoming");
  });
});

describe("deriveCurrentStage", () => {
  it("prefers the stage marked current", () => {
    const current = deriveCurrentStage(
      [
        { stage: "registration", status: "completed" },
        { stage: "counselling_1", status: "current" },
        { stage: "spot_round", status: "upcoming" },
      ],
      "closed",
    );
    assert.equal(current, "counselling_1");
  });

  it("falls back to first upcoming when nothing is current", () => {
    const current = deriveCurrentStage(
      [
        { stage: "registration", status: "completed" },
        { stage: "spot_round", status: "upcoming" },
      ],
      "closed",
    );
    assert.equal(current, "spot_round");
  });

  it("falls back to last stage when all completed", () => {
    const current = deriveCurrentStage(
      [
        { stage: "registration", status: "completed" },
        { stage: "closed", status: "completed" },
      ],
      "registration",
    );
    assert.equal(current, "closed");
  });

  it("uses the fallback for an empty timeline", () => {
    assert.equal(deriveCurrentStage([], "closed"), "closed");
  });
});
