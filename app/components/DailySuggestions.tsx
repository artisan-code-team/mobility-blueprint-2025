import { prisma } from '@/lib/prisma'
import { DailySuggestionsClient } from './DailySuggestionsClient'
import { Exercise } from '@/app/types/exercise'

/**
 * Gets suggested exercises for a user that they haven't completed in the last month.
 * 
 * This function:
 * 1. Uses a CTE to rank exercises within each category/subcategory randomly
 * 2. Filters out exercises completed by the user in the last month
 * 3. Selects one random exercise from each category/subcategory combination
 * 4. Returns exercises sorted by category and name
 * 
 * @param userId - The ID of the user to get suggestions for
 * @returns Array of suggested Exercise objects
 */
async function getSuggestedExercises(userId: string) {
  const exercises = await prisma.$queryRaw<Exercise[]>`
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
    SELECT id, name, description, "imageUrl", category, "subCategory"
    FROM RankedExercises
    WHERE rn = 1
    ORDER BY category, name;
  `

  return exercises
}

export async function DailySuggestions({ userId }: { userId: string }) {
  const suggestedExercises = await getSuggestedExercises(userId)
  
  // Get exercises completed by the user today by querying completions since midnight
  // and including the full exercise details for each completion
  const completedExercises = await prisma.exerciseCompletion.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    include: {
      exercise: true,
    },
  })

  return (
    <DailySuggestionsClient
      initialSuggestedExercises={suggestedExercises}
      completedExercises={completedExercises}
    />
  )
} 