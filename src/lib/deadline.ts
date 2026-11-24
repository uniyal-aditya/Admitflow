// ─────────────────────────────────────────────────────────────────────────
// Deadline engine (Phase 4)
//
// Time-derived state is computed here, server-side at request time, from the
// structured dates in the normalized tables (AdmissionNoticeDate and
// LegacyTimelineStage). The Deadline table is reserved for user-owned
// deadlines and is deliberately not consulted for dataset-derived state.
//
// Every derivation is a pure function of (rows, now) so it is unit-testable
// without a database; `now` is injectable for tests. This module must stay
// free of server-only imports (prisma, "server-only") because client code
// delegates to the same implementations via src/lib/utils.ts.
// ─────────────────────────────────────────────────────────────────────────

export type NoticeStatus = "active" | "upcoming" | "expired";
export type StageStatus = "completed" | "current" | "upcoming";

/** Parse a DB date / ISO string; empty or unparseable values → null. */
function toDate(value: Date | string | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Derive a notice's live status from its published date and last (deadline)
 * date. A notice past its deadline is expired; one published in the future is
 * upcoming; everything else is active. Missing dates never constrain.
 */
export function deriveNoticeStatus(
  publishedAt: Date | string | null | undefined,
  lastDate: Date | string | null | undefined,
  now: Date = new Date(),
): NoticeStatus {
  const published = toDate(publishedAt);
  const deadline = toDate(lastDate);
  if (deadline && deadline < now) return "expired";
  if (published && published > now) return "upcoming";
  return "active";
}

export interface RawTimelineStage {
  stage: string;
  label: string;
  date?: string;
  /** Status persisted by the dataset — trusted as an override for "current". */
  status: string;
  description?: string;
}

/**
 * Re-derive stage statuses from their dates at request time. A stage whose
 * date has passed becomes completed, unless the dataset explicitly marks it
 * "current" (dataset override wins, matching legacy computeTimeline).
 */
export function deriveTimelineStages<S extends RawTimelineStage>(
  stages: S[],
  now: Date = new Date(),
): (S & { status: StageStatus })[] {
  return stages.map((s, i) => {
    let status = s.status as StageStatus;
    if (s.status === "current") {
      // A dataset "current" marker is only trusted while it is still true:
      // if any LATER stage's date has already passed, the marker is stale
      // (the process has moved on) and the stage falls back to date logic.
      const staleMarker = stages.slice(i + 1).some((later) => {
        const d = toDate(later.date);
        return d !== null && d < now;
      });
      if (!staleMarker) return { ...s, status };
    }
    const d = toDate(s.date);
    if (d && d < now && status !== "completed") status = "completed";
    if (s.status === "current" && status !== "completed") status = "upcoming";
    return { ...s, status };
  });
}

/** True when every stage is completed, i.e. the admission cycle is over. */
export function isCycleEnded(stages: { status: string }[]): boolean {
  return stages.length > 0 && stages.every((s) => s.status === "completed");
}

/**
 * Pick the timeline's current stage from derived statuses: the stage marked
 * "current", else the first upcoming one, else the last stage. Used by the
 * service layer where the dataset does not carry an authoritative
 * currentStage (unlike legacy static data, which keeps its own).
 */
export function deriveCurrentStage(
  stages: { stage: string; status: StageStatus }[],
  fallback: string,
): string {
  return (
    stages.find((s) => s.status === "current")?.stage ??
    stages.find((s) => s.status === "upcoming")?.stage ??
    stages.at(-1)?.stage ??
    fallback
  );
}
