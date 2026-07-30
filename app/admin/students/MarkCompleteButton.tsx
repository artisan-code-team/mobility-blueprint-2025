'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MarkCompleteButtonProps {
  studentId: string
  exerciseId: string
}

/**
 * Instructor-facing action: marks an exercise complete for the student being
 * viewed on /admin/students, right from the staleness list. Unlike the
 * self-serve CompleteExerciseButton, this always refreshes the completion to
 * "now" — there's no cooldown, since this is a trusted manual instructor
 * action rather than something a student could spam against themselves.
 */
export function MarkCompleteButton({ studentId, exerciseId }: MarkCompleteButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (isPending) return
    setError(null)
    try {
      setIsPending(true)
      const response = await fetch(`/api/admin/students/${studentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark exercise complete')
      }

      router.refresh()
    } catch (err) {
      console.error('Error marking exercise complete:', err)
      setError('Failed')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        isPending
          ? 'bg-slate-100 text-slate-400 cursor-wait'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {error ? error : isPending ? 'Marking…' : 'Mark complete'}
    </button>
  )
}
