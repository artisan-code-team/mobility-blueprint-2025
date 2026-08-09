import { prisma } from '@/lib/prisma'
import type { ExerciseCompletion, Exercise as PrismaExercise, Prisma } from '@prisma/client'
import { getCatalogProgress } from '@/lib/exercises/progress'

interface SuggestedExercise {
  id: string
  name: string
  description: Prisma.JsonValue | null
  imageUrl: string | null
  category: string
  subCategory: string | null
  hasLeftRight: boolean
}

export type DashboardCompletionWithExercise = ExerciseCompletion & {
  exercise: PrismaExercise
}

export type DashboardDailySuggestionsPayload = {
  suggestedExercises: SuggestedExercise[]
  completedExercises: DashboardCompletionWithExercise[]
  /** Every catalog exercise has a completion within the rolling month window (matches suggestions SQL). */
  fullLibraryCompleteInRollingWindow: boolean
}

/**
 * Returns one un-completed exercise per category/subcategory group for the
 * given user, excluding anything completed in the last month. Within each
 * group, exercises that have gone longest without being completed are
 * prioritized (never-completed exercises rank above ones the user is merely
 * eligible for again after the cooldown), with a random tiebreak among
 * exercises that are equally overdue (e.g. multiple never-completed in the
 * same group).
 *
 * A group with any completion today is excluded entirely rather than being
 * given a replacement candidate — otherwise a group whose exercise the user
 * already completed today would rotate in a *different* exercise on the next
 * page load, so the same slot appears to show two exercises for one day
 * (the just-completed one plus a fresh "next up" one). `todayStart` should be
 * the same start-of-day boundary the caller uses to fetch today's completions,
 * so both agree on what "today" means.
 */
export async function getSuggestedExercises(
  userId: string,
  todayStart: Date
): Promise<SuggestedExercise[]> {
  return prisma.$queryRaw<SuggestedExercise[]>`
    WITH LastCompletion AS (
      SELECT ec."exerciseId", MAX(ec."createdAt") AS last_completed_at
      FROM exercise_completions ec
      WHERE ec."userId" = ${userId}
      GROUP BY ec."exerciseId"
    ),
    CompletedTodaySlots AS (
      SELECT DISTINCT e.category, e."subCategory"
      FROM exercise_completions ec
      JOIN exercises e ON e.id = ec."exerciseId"
      WHERE ec."userId" = ${userId}
        AND ec."createdAt" >= ${todayStart}
    ),
    RankedExercises AS (
      SELECT
        e.*,
        lc.last_completed_at,
        ROW_NUMBER() OVER (
          PARTITION BY e.category, e."subCategory"
          ORDER BY lc.last_completed_at ASC NULLS FIRST, random()
        ) as rn
      FROM exercises e
      LEFT JOIN LastCompletion lc ON lc."exerciseId" = e.id
      WHERE (lc.last_completed_at IS NULL OR lc.last_completed_at < NOW() - INTERVAL '1 month')
        AND NOT EXISTS (
          SELECT 1 FROM CompletedTodaySlots cts
          WHERE cts.category = e.category
            AND cts."subCategory" IS NOT DISTINCT FROM e."subCategory"
        )
    )
    SELECT
      id,
      name,
      description,
      "imageUrl",
      category,
      "subCategory",
      "hasLeftRight"
    FROM RankedExercises
    WHERE rn = 1
    ORDER BY category, name;
  `
}

/**
 * Returns all exercises the user is eligible for today (not completed
 * in the last month), in random order.
 */
export async function getEligibleExercises(userId: string): Promise<SuggestedExercise[]> {
  return prisma.$queryRaw<SuggestedExercise[]>`
    SELECT
      e.id,
      e.name,
      e.description,
      e."imageUrl",
      e.category,
      e."subCategory",
      e."hasLeftRight"
    FROM exercises e
    WHERE NOT EXISTS (
      SELECT 1
      FROM exercise_completions ec
      WHERE e.id = ec."exerciseId"
      AND ec."userId" = ${userId}
      AND ec."createdAt" >= NOW() - INTERVAL '1 month'
    )
    ORDER BY random();
  `
}

/**
 * Loads dashboard daily-suggestion data in one round trip where possible.
 * `fullLibraryCompleteInRollingWindow` is true when the user has a completion
 * dated within the rolling one-month window for every exercise in the catalog
 * (same rule as category pages and `/api/exercises/complete`) — this is
 * intentionally derived from `getCatalogProgress`, not from
 * `suggestedExercises` being empty, since `suggestedExercises` now also goes
 * empty just from finishing today's slots (see `getSuggestedExercises`),
 * which is a much smaller bar than the whole catalog.
 */
export async function getDashboardDailySuggestionsPayload(
  userId: string
): Promise<DashboardDailySuggestionsPayload> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [suggestedExercises, completedExercises, catalogProgress] = await Promise.all([
    getSuggestedExercises(userId, today),
    prisma.exerciseCompletion.findMany({
      where: {
        userId,
        createdAt: { gte: today },
      },
      include: { exercise: true },
    }),
    getCatalogProgress(userId),
  ])

  const fullLibraryCompleteInRollingWindow =
    catalogProgress.totalCount > 0 && catalogProgress.completedCount >= catalogProgress.totalCount

  return {
    suggestedExercises,
    completedExercises,
    fullLibraryCompleteInRollingWindow,
  }
}
