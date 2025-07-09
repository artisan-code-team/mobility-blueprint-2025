import { prisma } from '@/lib/prisma'
import { DailySuggestionsClient } from './DailySuggestionsClient'
import { Exercise } from '@/app/types/exercise'

/**
 * Gets suggested exercises for a user that they haven't completed in the last month.
 * 
 * The SQL query:
 * 1. Uses a CTE to create a temporary table of exercises with their rank
 * 2. Ranks exercises within each category/subcategory randomly
 * 3. Filters out exercises completed by the user in the last month
 * 4. Selects one random exercise from each category/subcategory combination
 * 5. Returns exercises sorted by category and name
 * 
 * Note: This query can be tested directly in Prisma Studio or any SQL client
 * 
 * @param userId - The ID of the user to get suggestions for
 * @returns Array of suggested Exercise objects
 */
async function getSuggestedExercises(userId: string): Promise<Exercise[]> {
  // Using raw SQL for efficient random selection and grouping via window functions
  const exercises = await prisma.$queryRaw<Exercise[]>`
    WITH RankedExercises AS (
      SELECT 
        e.*,
        -- Assign random rank within each category/subcategory group
        ROW_NUMBER() OVER (
          PARTITION BY e.category, e."subCategory"
          ORDER BY (SELECT random())
        ) as rn
      FROM exercises e
      -- Exclude exercises completed in the last month
      WHERE NOT EXISTS (
        SELECT 1 
        FROM exercise_completions ec 
        WHERE e.id = ec."exerciseId" 
        AND ec."userId" = ${userId}
        AND ec."createdAt" >= NOW() - INTERVAL '1 month'
      )
    )
    -- Select only the randomly chosen exercise from each group
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

  return exercises
}

export async function DailySuggestions({ userId }: { userId: string }) {
  const suggestedExercises = await getSuggestedExercises(userId)
  
  // Get exercises completed today (from midnight to now)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedExercises = await prisma.exerciseCompletion.findMany({
    where: {
      userId,
      createdAt: {
        gte: today,
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