'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CompleteExerciseButtonProps {
  exerciseId: string
  isCompleted: boolean
  completedAt?: Date | null
  onComplete?: () => void
}

export function CompleteExerciseButton({ 
  exerciseId, 
  isCompleted,
  completedAt,
  onComplete 
}: CompleteExerciseButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  // Check if the exercise was completed within the last month
  const isRecentlyCompleted = () => {
    if (!isCompleted || !completedAt) return false
    
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    return new Date(completedAt) >= oneMonthAgo
  }

  const recentlyCompleted = isRecentlyCompleted()

  const handleComplete = async () => {
    if (recentlyCompleted || isPending) return

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
        if (response.status === 409) {
          throw new Error('Exercise completed within the last month')
        }
        throw new Error('Failed to complete exercise')
      }

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