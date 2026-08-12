'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlagIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { ExerciseDetailModal } from '@/app/components/ExerciseDetailModal'
import { getExerciseVisual } from '@/app/components/exerciseVisuals'
import type { StalenessItem } from '@/lib/admin/studentInsights'
import { Exercise } from '@/app/types/exercise'

interface StudentTimelineProps {
  studentId: string
  conditioning: StalenessItem[]
  restorative: StalenessItem[]
}

function formatDaysSince(daysSince: number | null) {
  if (daysSince === null) return 'never'
  if (daysSince === 0) return 'today'
  return `${daysSince}d ago`
}

/**
 * Matches the 30-day "this month" window used elsewhere (dashboard progress
 * ring, completion cooldown): green if done within the last month, red if
 * never done, slate for anything older.
 */
function daysSinceBadgeClass(daysSince: number | null) {
  if (daysSince === null) return 'bg-red-50 text-red-700'
  if (daysSince <= 30) return 'bg-green-50 text-green-700'
  return 'bg-slate-100 text-slate-600'
}

function toExercise(item: StalenessItem): Exercise {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    category: item.category,
    subCategory: item.subCategory,
    hasLeftRight: item.hasLeftRight,
  }
}

/**
 * Instructor-facing staleness timeline, styled to match the student
 * dashboard's daily suggestions: one continuous vertical timeline grouped by
 * category, each item tagged with its category and how long since the
 * student last did it, tapping through to the same detail modal (timer
 * included) rather than a thumbnail. Completion happens inside the modal on
 * behalf of the selected student — see studentId threaded into
 * ExerciseDetailModal.
 */
export function StudentTimeline({ studentId, conditioning, restorative }: StudentTimelineProps) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<StalenessItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const groups = [
    { key: 'conditioning', label: 'Conditioning', items: conditioning },
    { key: 'restorative', label: 'Restorative', items: restorative },
  ].filter((group) => group.items.length > 0)

  const openItem = (item: StalenessItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const handleComplete = () => {
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <ol className="relative">
        {groups.map((group, groupIndex) => {
          const sectionVisual = getExerciseVisual(group.key, null)
          const isLastGroup = groupIndex === groups.length - 1

          return (
            <Fragment key={group.key}>
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
                    {group.label}
                  </span>
                </div>
              </li>
              {group.items.map((item, index) => {
                const visual = getExerciseVisual(item.category, item.subCategory)
                const Icon = visual.icon
                const isVeryLastItem = isLastGroup && index === group.items.length - 1

                return (
                  <li key={item.id} className="relative pb-8 last:pb-0">
                    {!isVeryLastItem && (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="group relative flex w-full items-start gap-4 text-left"
                    >
                      <span
                        className={clsx(
                          'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                          visual.badgeClass
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-colors group-hover:border-slate-300 group-hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-base font-semibold normal-case text-slate-900">
                            {item.name}
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
                        <span
                          className={clsx(
                            'inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                            daysSinceBadgeClass(item.daysSince)
                          )}
                        >
                          {formatDaysSince(item.daysSince)}
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

      <ExerciseDetailModal
        exercise={selectedItem ? toExercise(selectedItem) : null}
        isOpen={isModalOpen}
        onClose={closeModal}
        isCompleted={false}
        completedAt={null}
        onComplete={handleComplete}
        studentId={studentId}
      />
    </div>
  )
}
