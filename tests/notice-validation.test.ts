import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NoticeValidationError, cleanTitle, cleanOptionalUrl, cleanList, checkDateOrder, makeNoticeId, slugify,
} from "../src/lib/notice-validation";

describe("notice validation", () => {
  it("builds ids from the college and the title", () => {
    assert.equal(makeNoticeId("gbpiet", "B.Tech Spot Round 2026!"), "gbpiet-b-tech-spot-round-2026");
    assert.equal(slugify("  Café  Notice "), "cafe-notice");
    assert.ok(makeNoticeId("x", "a".repeat(300)).length <= 100);
  });

  it("rejects short or missing titles and trims spaces", () => {
    assert.throws(() => cleanTitle("abc"), NoticeValidationError);
    assert.throws(() => cleanTitle(undefined), NoticeValidationError);
    assert.equal(cleanTitle("  Spot   round   open "), "Spot round open");
  });

  it("accepts only real http(s) addresses", () => {
    assert.equal(cleanOptionalUrl("", "Official link"), null);
    assert.equal(cleanOptionalUrl("https://www.iitr.ac.in/admissions", "Official link"), "https://www.iitr.ac.in/admissions");
    assert.throws(() => cleanOptionalUrl("javascript:alert(1)", "Official link"), NoticeValidationError);
    assert.throws(() => cleanOptionalUrl("not a link", "Official link"), NoticeValidationError);
    assert.throws(() => cleanOptionalUrl("https://localhost", "Official link"), NoticeValidationError);
  });

  it("cleans lists and removes blanks and duplicates", () => {
    assert.deepEqual(cleanList([" Marksheet ", "", "Marksheet", "ID"], "Documents"), ["Marksheet", "ID"]);
    assert.throws(() => cleanList("nope", "Documents"), NoticeValidationError);
  });

  it("does not allow a last date before the published date", () => {
    assert.throws(() => checkDateOrder(new Date("2026-09-10"), new Date("2026-09-01")), NoticeValidationError);
    assert.doesNotThrow(() => checkDateOrder(new Date("2026-09-10T18:00:00Z"), new Date("2026-09-10T01:00:00Z")));
    assert.doesNotThrow(() => checkDateOrder(null, new Date("2026-09-01")));
  });
});
