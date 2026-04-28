import { prisma } from '@/lib/prisma'
import { DailySuggestionsClient } from './DailySuggestionsClient'
import { getSuggestedExercises } from '@/lib/sessions/suggestions'

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