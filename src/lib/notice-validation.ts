/** Shared checks for notice data entered in the admin panel. Pure functions, no database access. */

export class NoticeValidationError extends Error {}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Notice ids are "<college-id>-<title-slug>", at most 100 characters. */
export function makeNoticeId(collegeId: string, title: string): string {
  const slug = slugify(title) || "notice";
  return `${collegeId}-${slug}`.slice(0, 100).replace(/-+$/, "");
}

export function cleanTitle(raw: unknown): string {
  if (typeof raw !== "string") throw new NoticeValidationError("Title is required.");
  const title = raw.trim().replace(/\s+/g, " ");
  if (title.length < 5) throw new NoticeValidationError("The title must be at least 5 characters long.");
  if (title.length > 200) throw new NoticeValidationError("The title must be 200 characters or fewer.");
  return title;
}

export function cleanSummary(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string") throw new NoticeValidationError("The summary must be text.");
  const summary = raw.trim();
  if (summary.length > 1000) throw new NoticeValidationError("The summary must be 1000 characters or fewer.");
  return summary || null;
}

/** Empty becomes null. Anything else must be a real http or https address. Blocks javascript: and similar. */
export function cleanOptionalUrl(raw: unknown, fieldName: string): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw !== "string") throw new NoticeValidationError(`${fieldName} must be a web address.`);
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new NoticeValidationError(`${fieldName} is not a valid web address. It should start with https://`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new NoticeValidationError(`${fieldName} must start with https:// or http://`);
  }
  if (!url.hostname.includes(".")) throw new NoticeValidationError(`${fieldName} is not a valid web address.`);
  return url.toString();
}

export function cleanList(raw: unknown, fieldName: string, max = 20): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new NoticeValidationError(`${fieldName} must be a list.`);
  const items = raw
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);
  if (items.length > max) throw new NoticeValidationError(`${fieldName} can have at most ${max} items.`);
  if (items.some((x) => x.length > 200)) throw new NoticeValidationError(`Each item in ${fieldName} must be 200 characters or fewer.`);
  return [...new Set(items)];
}

/** The last date cannot fall before the day the notice was published. */
export function checkDateOrder(publishedAt: Date | null, lastDate: Date | null): void {
  if (!publishedAt || !lastDate) return;
  const day = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  if (day(lastDate) < day(publishedAt)) {
    throw new NoticeValidationError("The last date cannot be earlier than the published date.");
  }
}
