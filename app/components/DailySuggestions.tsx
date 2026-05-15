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
  const { suggestedExercises, completedExercises, fullLibraryCompleteInRollingWindow } =
    preloaded ?? (await getDashboardDailySuggestionsPayload(userId))

  return (
    <DailySuggestionsClient
      initialSuggestedExercises={suggestedExercises}
      completedExercises={completedExercises}
      fullLibraryCompleteInRollingWindow={fullLibraryCompleteInRollingWindow}
    />
  )
}
