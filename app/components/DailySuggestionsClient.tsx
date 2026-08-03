'use client'

import { Fragment, useState } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { FlagIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { ExerciseDetailModal } from './ExerciseDetailModal'
import { getExerciseVisual } from './exerciseVisuals'
import { Exercise } from '@/app/types/exercise'

interface DailySuggestionsClientProps {
  initialSuggestedExercises: Exercise[]
  completedExercises: {
    id: string
    createdAt: Date
    exercise: Exercise
  }[]
}

// Conditioning is shown before Restorative to match the order used
// elsewhere in the app (e.g. the dashboard's category browse cards).
// Any other category value falls back to the order it's first seen in.
const CATEGORY_ORDER = ['conditioning', 'restorative']

function groupExercisesByCategory(exercises: Exercise[]) {
  const seenCategories = Array.from(new Set(exercises.map((exercise) => exercise.category)))
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((category) => seenCategories.includes(category)),
    ...seenCategories.filter((category) => !CATEGORY_ORDER.includes(category)),
  ]

  return orderedCategories.map((category) => ({
    category,
    exercises: exercises.filter((exercise) => exercise.category === category),
  }))
}

/**
 * Client-side component that renders the day's suggested exercises as a
 * vertical timeline. Items stay in their suggested order and switch to a
 * checked visual state on completion rather than being removed or moved to
 * a separate section. Tapping an item opens the full detail view.
 */
export function DailySuggestionsClient({
  initialSuggestedExercises,
  completedExercises,
}: DailySuggestionsClientProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(completedExercises.map((c) => c.exercise.id))
  )
  const [completedAtById, setCompletedAtById] = useState<Record<string, Date>>(
    () => Object.fromEntries(completedExercises.map((c) => [c.exercise.id, c.createdAt]))
  )
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const allCompleted =
    initialSuggestedExercises.length > 0 &&
    initialSuggestedExercises.every((exercise) => completedIds.has(exercise.id))

  const openExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedIds((prev) => new Set(prev).add(exerciseId))
    setCompletedAtById((prev) => ({ ...prev, [exerciseId]: new Date() }))
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Daily Suggestions</h2>
      {allCompleted && (
        <div className="mb-6 p-4 rounded-lg border border-green-200 bg-green-50 text-green-700">
          Congratulations! You have completed all exercises for today!
        </div>
      )}
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ol className="relative">
          {groupExercisesByCategory(initialSuggestedExercises).map((group, groupIndex, groups) => {
            const sectionVisual = getExerciseVisual(group.category, null)
            const isLastGroup = groupIndex === groups.length - 1

            return (
              <Fragment key={group.category}>
                <li className="relative pb-4">
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                  <div className="relative flex items-center gap-4">
                    <span
                      className={clsx(
                        'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                        sectionVisual.badgeClass
                      )}
                    >
                      <FlagIcon className="h-5 w-5 text-white" />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      {sectionVisual.label}
                    </span>
                  </div>
                </li>
                {group.exercises.map((exercise, index) => {
                  const isDone = completedIds.has(exercise.id)
                  const visual = getExerciseVisual(exercise.category, exercise.subCategory)
                  const Icon = visual.icon
                  const isVeryLastExercise = isLastGroup && index === group.exercises.length - 1

                  return (
                    <li key={exercise.id} className="relative pb-8 last:pb-0">
                      {!isVeryLastExercise && (
                        <span
                          className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => openExercise(exercise)}
                        className="group relative flex w-full items-start gap-4 text-left"
                      >
                        <span
                          className={clsx(
                            'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                            isDone ? 'bg-emerald-500' : visual.badgeClass
                          )}
                        >
                          {isDone ? (
                            <CheckIcon className="h-5 w-5 text-white" />
                          ) : (
                            <Icon className="h-5 w-5 text-white" />
                          )}
                        </span>
                        <span
                          className={clsx(
                            'flex min-w-0 flex-1 flex-col gap-1 rounded-lg border p-3 transition-colors',
                            isDone
                              ? 'border-emerald-100 bg-emerald-50/60'
                              : 'border-slate-200 bg-white group-hover:border-slate-300 group-hover:shadow-sm'
                          )}
                        >
                          <span
                            className={clsx(
                              'text-base font-semibold normal-case',
                              isDone ? 'text-slate-500' : 'text-slate-900'
                            )}
                          >
                            {exercise.name}
                          </span>
                          <span
                            className={clsx(
                              'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                              visual.tagClass
                            )}
                          >
                            {visual.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </Fragment>
            )
          })}
        </ol>
      </div>

      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={closeModal}
        isCompleted={selectedExercise ? completedIds.has(selectedExercise.id) : false}
        completedAt={selectedExercise ? completedAtById[selectedExercise.id] ?? null : null}
        onComplete={() => selectedExercise && handleExerciseComplete(selectedExercise.id)}
      />
    </div>
  )
}
