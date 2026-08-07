'use client'

import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { completeExercise, isRecentlyCompleted } from '@/lib/exercises/completeExercise'

interface LeftRightToggleProps {
  exerciseId: string
  isCompleted: boolean
  completedAt: Date | null
  onCompleted: () => void
}

type Side = 'left' | 'right'

/**
 * Two circular completion toggles for exercises with a left/right variant.
 * Tapping a side just marks that side done — the exercise as a whole is
 * completed (via the same endpoint CompleteExerciseButton uses) the moment
 * both sides are checked.
 */
export function LeftRightToggle({ exerciseId, isCompleted, completedAt, onCompleted }: LeftRightToggleProps) {
  const locked = isRecentlyCompleted(isCompleted, completedAt)
  const [leftDone, setLeftDone] = useState(isCompleted)
  const [rightDone, setRightDone] = useState(isCompleted)
  const [isPending, setIsPending] = useState(false)

  const handleSide = async (side: Side) => {
    if (locked || isPending) return
    if (side === 'left' ? leftDone : rightDone) return

    const otherDone = side === 'left' ? rightDone : leftDone
    if (side === 'left') setLeftDone(true)
    else setRightDone(true)

    if (!otherDone) return

    try {
      setIsPending(true)
      await completeExercise(exerciseId)
      onCompleted()
    } catch (error) {
      console.error('Error completing exercise:', error)
      if (side === 'left') setLeftDone(false)
      else setRightDone(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-6">
      {(['left', 'right'] as const).map((side) => {
        const done = side === 'left' ? leftDone : rightDone
        return (
          <button
            key={side}
            type="button"
            onClick={() => handleSide(side)}
            disabled={locked || done || isPending}
            aria-pressed={done}
            aria-label={side === 'left' ? 'Mark left side complete' : 'Mark right side complete'}
            className={clsx(
              'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-sm transition-colors',
              done
                ? 'bg-green-500 text-white'
                : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50',
              isPending && !done && 'cursor-wait opacity-60',
              locked && !done && 'cursor-not-allowed opacity-60'
            )}
          >
            {done ? <CheckIcon className="h-7 w-7" /> : side === 'left' ? 'L' : 'R'}
          </button>
        )
      })}
    </div>
  )
}
