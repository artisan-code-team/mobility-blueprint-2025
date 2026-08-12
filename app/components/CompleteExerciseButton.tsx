'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeExercise, isRecentlyCompleted } from '@/lib/exercises/completeExercise'

interface CompleteExerciseButtonProps {
  exerciseId: string
  isCompleted: boolean
  completedAt?: Date | null
  onComplete?: () => void
  /** Instructor context: completes on behalf of this student, bypassing the cooldown below. */
  studentId?: string
}

export function CompleteExerciseButton({
  exerciseId,
  isCompleted,
  completedAt,
  onComplete,
  studentId,
}: CompleteExerciseButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const recentlyCompleted = studentId ? false : isRecentlyCompleted(isCompleted, completedAt)

  const handleComplete = async () => {
    if (recentlyCompleted || isPending) return

    try {
      setIsPending(true)
      await completeExercise(exerciseId, studentId)

      router.refresh()
      onComplete?.()
    } catch (error) {
      console.error('Error completing exercise:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={recentlyCompleted || isPending}
      className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors
        ${
          recentlyCompleted
            ? 'bg-green-100 text-green-800 cursor-default'
            : isPending
            ? 'bg-slate-100 text-slate-400 cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
    >
      {recentlyCompleted 
        ? 'Completed (within last month)' 
        : isPending 
        ? 'Completing...' 
        : 'Complete Exercise'
      }
    </button>
  )
} 