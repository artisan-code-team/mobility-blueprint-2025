'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CompleteExerciseButtonProps {
  exerciseId: string
  isCompleted: boolean
}

export function CompleteExerciseButton({ exerciseId, isCompleted }: CompleteExerciseButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    if (isCompleted || isPending) return

    try {
      setIsPending(true)
      const response = await fetch('/api/exercises/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exerciseId }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete exercise')
      }

      router.refresh()
    } catch (error) {
      console.error('Error completing exercise:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isCompleted || isPending}
      className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors
        ${
          isCompleted
            ? 'bg-green-100 text-green-800 cursor-default'
            : isPending
            ? 'bg-slate-100 text-slate-400 cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
    >
      {isCompleted ? 'Completed' : isPending ? 'Completing...' : 'Complete Exercise'}
    </button>
  )
} 