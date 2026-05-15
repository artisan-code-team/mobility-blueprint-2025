import { prisma } from '@/lib/prisma'
import type { ExerciseCompletion, Exercise as PrismaExercise } from '@prisma/client'

interface SuggestedExercise {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  subCategory: string | null
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
 * Returns one random un-completed exercise per category/subcategory group
 * for the given user, excluding anything completed in the last month.
 *
 * This is the same query used by the DailySuggestions server component,
 * extracted here so it can be reused by the group-session intersection logic.
 */
export async function getSuggestedExercises(userId: string): Promise<SuggestedExercise[]> {
  return prisma.$queryRaw<SuggestedExercise[]>`
    WITH RankedExercises AS (
      SELECT 
        e.*,
        ROW_NUMBER() OVER (
          PARTITION BY e.category, e."subCategory"
          ORDER BY (SELECT random())
        ) as rn
      FROM exercises e
      WHERE NOT EXISTS (
        SELECT 1 
        FROM exercise_completions ec 
        WHERE e.id = ec."exerciseId" 
        AND ec."userId" = ${userId}
        AND ec."createdAt" >= NOW() - INTERVAL '1 month'
      )
    )
    SELECT 
      id, 
      name, 
      description, 
      "imageUrl", 
      category, 
      "subCategory"
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
      e."subCategory"
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
 * (same rule as category pages and `/api/exercises/complete`).
 */
export async function getDashboardDailySuggestionsPayload(
  userId: string
): Promise<DashboardDailySuggestionsPayload> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [suggestedExercises, totalExercises, completedExercises] = await Promise.all([
    getSuggestedExercises(userId),
    prisma.exercise.count(),
    prisma.exerciseCompletion.findMany({
      where: {
        userId,
        createdAt: { gte: today },
      },
      include: { exercise: true },
    }),
  ])

  const fullLibraryCompleteInRollingWindow =
    totalExercises > 0 && suggestedExercises.length === 0

  return {
    suggestedExercises,
    completedExercises,
    fullLibraryCompleteInRollingWindow,
  }
}
