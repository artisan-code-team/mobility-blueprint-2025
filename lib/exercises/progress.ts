import { prisma } from '@/lib/prisma'

export type CatalogProgress = {
  /** Count of distinct exercises this user has completed within the last 30 days. */
  completedCount: number
  /** Total number of exercises currently in the catalog. */
  totalCount: number
}

/**
 * Returns how many distinct exercises in the catalog this user has completed
 * within the rolling 30-day window, versus the total size of the catalog.
 *
 * The goal this ring tracks is cycling through the *entire* catalog within a
 * month (that's what keeps connective tissue in a state of growth) — not
 * lifetime completion. `ExerciseCompletion` is a one-time flag per
 * user+exercise (`@@unique([userId, exerciseId])`); `createdAt` gets
 * refreshed (deleted + recreated) whenever the exercise is re-completed after
 * 30+ days, per `app/api/exercises/complete/route.ts`. So filtering to rows
 * with `createdAt` in the last 30 days is exactly "completed this month,"
 * matching the app's own re-completion cooldown rather than counting
 * everything ever done, which would show 100% forever for an experienced
 * student and be useless as a monthly goal.
 */
export async function getCatalogProgress(userId: string): Promise<CatalogProgress> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [completedCount, totalCount] = await Promise.all([
    prisma.exerciseCompletion.count({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.exercise.count(),
  ])

  return { completedCount, totalCount }
}
