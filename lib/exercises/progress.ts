import { prisma } from '@/lib/prisma'
import { REQUIRED_CATEGORIES } from '@/lib/exercises/categories'
import { getRollingWindowStart } from '@/lib/exercises/rollingWindow'

export type CatalogProgress = {
  /** Count of distinct required-plan exercises this user has completed within the last 30 days. */
  completedCount: number
  /** Total number of required-plan exercises currently in the catalog. */
  totalCount: number
}

/**
 * Returns how many distinct exercises in the *required plan* this user has
 * completed within the rolling 30-day window, versus the size of that plan.
 *
 * The goal this ring tracks is cycling through every Conditioning and
 * Restorative exercise within a month (that's what keeps connective tissue in
 * a state of growth) — not lifetime completion, and not the whole catalog.
 * Bonus categories (see `lib/exercises/categories.ts`) are excluded from both
 * the numerator and the denominator, so optional work can neither inflate the
 * ring's total nor move the needle on it.
 *
 * `ExerciseCompletion` is a one-time flag per
 * user+exercise (`@@unique([userId, exerciseId])`); `createdAt` gets
 * refreshed (deleted + recreated) whenever the exercise is re-completed after
 * 30+ days, per `app/api/exercises/complete/route.ts`. So filtering to rows
 * with `createdAt` in the last 30 days is exactly "completed this month,"
 * matching the app's own re-completion cooldown rather than counting
 * everything ever done, which would show 100% forever for an experienced
 * student and be useless as a monthly goal.
 */
export async function getCatalogProgress(userId: string): Promise<CatalogProgress> {
  const [completedCount, totalCount] = await Promise.all([
    prisma.exerciseCompletion.count({
      where: {
        userId,
        createdAt: { gte: getRollingWindowStart() },
        exercise: { category: { in: [...REQUIRED_CATEGORIES] } },
      },
    }),
    prisma.exercise.count({
      where: { category: { in: [...REQUIRED_CATEGORIES] } },
    }),
  ])

  return { completedCount, totalCount }
}
