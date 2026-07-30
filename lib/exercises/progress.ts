import { prisma } from '@/lib/prisma'

export type CatalogProgress = {
  /** Count of distinct exercises this user has completed at least once. */
  completedCount: number
  /** Total number of exercises currently in the catalog. */
  totalCount: number
}

/**
 * Returns how many distinct exercises in the catalog this user has ever
 * completed at least once, versus the total size of the catalog.
 *
 * `ExerciseCompletion` is a one-time flag per user+exercise (enforced by the
 * `@@unique([userId, exerciseId])` constraint), so a plain row count for the
 * user is equivalent to a distinct-exercise count — no need to dedupe.
 */
export async function getCatalogProgress(userId: string): Promise<CatalogProgress> {
  const [completedCount, totalCount] = await Promise.all([
    prisma.exerciseCompletion.count({ where: { userId } }),
    prisma.exercise.count(),
  ])

  return { completedCount, totalCount }
}
