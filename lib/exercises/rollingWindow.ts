/**
 * Single source of truth for the rolling window used everywhere "this
 * month" is computed for exercise completions: the re-completion cooldown,
 * the dashboard progress ring, daily suggestion eligibility, and the
 * instructor staleness view.
 *
 * Previously this was duplicated as both a fixed 30-day window (progress
 * ring, staleness view) and a calendar "1 month" window (completion
 * cooldown, suggestion eligibility) at different call sites. A calendar
 * month is almost always longer than 30 days (28-31, depending on the
 * month), so an exercise could fall out of the fixed-30-day "still counts
 * as done" window before the calendar-month "eligible to redo" window
 * opened — a gap where it vanished from both the progress count and the
 * suggestions list at once. See CHA-46.
 */
export const ROLLING_WINDOW_DAYS = 30

/** `now - ROLLING_WINDOW_DAYS`, for Prisma `gte`/`lt` filters on `createdAt`. */
export function getRollingWindowStart(now: Date = new Date()): Date {
  const start = new Date(now)
  start.setDate(start.getDate() - ROLLING_WINDOW_DAYS)
  return start
}

/**
 * Raw SQL interval text for `$queryRaw` templates. Wrap with `Prisma.raw(...)`
 * at the call site (kept as a plain string here, with no Prisma import, so
 * this file stays safe to import from client components via
 * `lib/exercises/completeExercise.ts`).
 */
export const ROLLING_WINDOW_SQL_INTERVAL = `INTERVAL '${ROLLING_WINDOW_DAYS} days'`
