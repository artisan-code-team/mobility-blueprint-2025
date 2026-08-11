import { DailySuggestionsClient } from './DailySuggestionsClient'
import {
  getDashboardDailySuggestionsPayload,
  type DashboardDailySuggestionsPayload,
} from '@/lib/sessions/suggestions'

type DailySuggestionsProps = {
  userId: string
  preloaded?: DashboardDailySuggestionsPayload
}

export async function DailySuggestions({ userId, preloaded }: DailySuggestionsProps) {
  const { suggestedExercises, completedExercises, bonusExercises } =
    preloaded ?? (await getDashboardDailySuggestionsPayload(userId))

  return (
    <DailySuggestionsClient
      initialSuggestedExercises={suggestedExercises}
      completedExercises={completedExercises}
      bonusExercises={bonusExercises}
    />
  )
} 