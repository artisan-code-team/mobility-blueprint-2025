import { getRollingWindowStart } from '@/lib/exercises/rollingWindow'

/**
 * Whether an exercise was completed within the rolling 30-day window — the
 * app's cooldown before an exercise can be marked complete again.
 */
export function isRecentlyCompleted(isCompleted: boolean, completedAt: Date | null | undefined): boolean {
  if (!isCompleted || !completedAt) return false

  return new Date(completedAt) >= getRollingWindowStart()
}

/**
 * Marks an exercise complete via POST /api/exercises/complete for the current
 * user, or POST /api/admin/students/:studentId/complete on behalf of a
 * student when studentId is passed (instructor use from /admin/students —
 * no cooldown there). Throws if the exercise was completed within the last
 * 30 days (409, self-serve only) or the request otherwise fails.
 */
export async function completeExercise(exerciseId: string, studentId?: string): Promise<void> {
  const url = studentId ? `/api/admin/students/${studentId}/complete` : '/api/exercises/complete'
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exerciseId }),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Exercise completed within the last 30 days')
    }
    throw new Error('Failed to complete exercise')
  }
}
