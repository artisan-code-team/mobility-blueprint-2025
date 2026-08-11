'use client'

import { Fragment, useState } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { FlagIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { ExerciseDetailModal } from './ExerciseDetailModal'
import { getExerciseVisual, BONUS_SECTION_VISUAL } from './exerciseVisuals'
import { isBonusCategory } from '@/lib/exercises/categories'
import { Exercise } from '@/app/types/exercise'

interface DailySuggestionsClientProps {
  initialSuggestedExercises: Exercise[]
  completedExercises: {
    id: string
    createdAt: Date
    exercise: Exercise
  }[]
  bonusExercises?: Exercise[]
}

const BONUS_GROUP = 'bonus'

// Conditioning is shown before Restorative to match the order used
// elsewhere in the app (e.g. the dashboard's category browse cards), with
// bonus work last. Any other category value falls back to the order it's
// first seen in.
const CATEGORY_ORDER = ['conditioning', 'restorative', BONUS_GROUP]

// Every bonus category collapses into one group so the timeline shows a
// single "Bonus Exercises" heading rather than one heading per bonus
// category. Items still render their own category on their chip.
function groupKeyFor(exercise: Exercise) {
  return isBonusCategory(exercise.category) ? BONUS_GROUP : exercise.category
}

function groupExercisesByCategory(exercises: Exercise[]) {
  const seenGroups = Array.from(new Set(exercises.map(groupKeyFor)))
  const orderedGroups = [
    ...CATEGORY_ORDER.filter((group) => seenGroups.includes(group)),
    ...seenGroups.filter((group) => !CATEGORY_ORDER.includes(group)),
  ]

  return orderedGroups.map((group) => ({
    category: group,
    exercises: exercises.filter((exercise) => groupKeyFor(exercise) === group),
  }))
}

function getSectionVisual(group: string) {
  return group === BONUS_GROUP ? BONUS_SECTION_VISUAL : getExerciseVisual(group, null)
}

// The day's suggestions are a fixed set for the session: whatever was
// suggested on load is what the user works through, one flip at a time.
// This only backfills an exercise that was completed earlier today (before
// this page load) but has since rotated out of the live suggestions query —
// it does not run again after mount, so nothing new rotates in mid-session.
function mergeSuggestedWithCompleted(
  suggested: Exercise[],
  completed: { exercise: Exercise }[]
): Exercise[] {
  const seen = new Set(suggested.map((exercise) => exercise.id))
  const missing = completed
    .map((c) => c.exercise)
    .filter((exercise) => {
      if (seen.has(exercise.id)) return false
      seen.add(exercise.id)
      return true
    })

  return missing.length > 0 ? [...suggested, ...missing] : suggested
}

function buildCompletionMessage(
  categoryLabel: string,
  remainingInCategory: number,
  remainingTotal: number
) {
  if (remainingTotal === 0) return 'That was the last one for today. Nice work!'

  const categoryPart =
    remainingInCategory === 0
      ? `That's the last one in ${categoryLabel} for now.`
      : `Only ${remainingInCategory} more to go in ${categoryLabel}.`

  return `${categoryPart} ${remainingTotal} more total.`
}

/**
 * Client-side component that renders the day's suggested exercises as a
 * vertical timeline. The set of exercises is fixed for the session as soon
 * as this component mounts: items stay in their suggested order and switch
 * to a checked visual state on completion rather than being removed,
 * replaced, or moved to a separate section. Tapping an item opens the full
 * detail view.
 */
export function DailySuggestionsClient({
  initialSuggestedExercises,
  completedExercises,
  bonusExercises = [],
}: DailySuggestionsClientProps) {
  const [displayedExercises] = useState<Exercise[]>(() =>
    mergeSuggestedWithCompleted(
      [...initialSuggestedExercises, ...bonusExercises],
      completedExercises
    )
  )
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(completedExercises.map((c) => c.exercise.id))
  )
  const [completedAtById, setCompletedAtById] = useState<Record<string, Date>>(
    () => Object.fromEntries(completedExercises.map((c) => [c.exercise.id, c.createdAt]))
  )
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)

  const allCompleted =
    displayedExercises.length > 0 &&
    displayedExercises.every((exercise) => completedIds.has(exercise.id))

  const openExercise = (exercise: Exercise) => {
    setCompletionMessage(null)
    setSelectedExercise(exercise)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCompletionMessage(null)
  }

  const handleExerciseComplete = (exerciseId: string) => {
    const exercise = displayedExercises.find((e) => e.id === exerciseId)

    const updatedIds = new Set(completedIds)
    updatedIds.add(exerciseId)
    setCompletedIds(updatedIds)
    setCompletedAtById((prev) => ({ ...prev, [exerciseId]: new Date() }))

    if (exercise) {
      const group = groupKeyFor(exercise)
      const remainingInCategory = displayedExercises.filter(
        (e) => groupKeyFor(e) === group && !updatedIds.has(e.id)
      ).length
      const remainingTotal = displayedExercises.filter((e) => !updatedIds.has(e.id)).length
      const categoryLabel = getSectionVisual(group).label
      setCompletionMessage(buildCompletionMessage(categoryLabel, remainingInCategory, remainingTotal))
    }
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
          {groupExercisesByCategory(displayedExercises).map((group, groupIndex, groups) => {
            const sectionVisual = getSectionVisual(group.category)
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
        completionMessage={completionMessage}
      />
    </div>
  )
}
