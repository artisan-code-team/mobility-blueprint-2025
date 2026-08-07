/**
 * Whether an exercise was completed within the last month — the app's
 * cooldown window before an exercise can be marked complete again.
 */
export function isRecentlyCompleted(isCompleted: boolean, completedAt: Date | null | undefined): boolean {
  if (!isCompleted || !completedAt) return false

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  return new Date(completedAt) >= oneMonthAgo
}

/**
 * Marks an exercise complete for the current user via POST /api/exercises/complete.
 * Throws if the exercise was completed within the last month (409) or the
 * request otherwise fails.
 */
export async function completeExercise(exerciseId: string): Promise<void> {
  const response = await fetch('/api/exercises/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exerciseId }),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Exercise completed within the last month')
    }
    throw new Error('Failed to complete exercise')
  }
}
