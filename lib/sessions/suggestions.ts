import { prisma } from '@/lib/prisma'

interface SuggestedExercise {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  subCategory: string | null
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
