import { prisma } from '@/lib/prisma'
import { DailySuggestionsClient } from './DailySuggestionsClient'

interface Exercise {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  subCategory: string | null
}

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