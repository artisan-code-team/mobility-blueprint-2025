'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import clsx from 'clsx'
import { CompleteExerciseButton } from './CompleteExerciseButton'
import { LeftRightToggle } from './LeftRightToggle'
import { ExerciseTimer } from './ExerciseTimer'
import { getExerciseVisual } from './exerciseVisuals'
import { createExerciseDescriptionComponents, isPortableTextBlocks } from './exerciseDescription'
import { Exercise } from '@/app/types/exercise'

const descriptionComponents = createExerciseDescriptionComponents(
  'mt-3 text-base leading-relaxed text-slate-600'
)

interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  isCompleted: boolean
  completedAt: Date | null
  onComplete: () => void
  completionMessage?: string | null
}

export function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  isCompleted,
  completedAt,
  onComplete,
  completionMessage,
}: ExerciseDetailModalProps) {
  if (!exercise) return null

  const visual = getExerciseVisual(exercise.category, exercise.subCategory)
  const Icon = visual.icon

  const handleCompleted = () => {
    onComplete()
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/60 duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center sm:p-4">
        <DialogPanel
          transition
          className="flex h-full w-full flex-col overflow-y-auto bg-white duration-200 ease-out data-[closed]:translate-y-4 data-[closed]:opacity-0 sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:shadow-xl"
        >
          <div className="relative h-56 w-full flex-shrink-0 bg-slate-100 sm:h-64 sm:rounded-t-2xl">
            {exercise.imageUrl && (
              <Image
                src={exercise.imageUrl}
                alt={exercise.name}
                fill
                className="object-cover sm:rounded-t-2xl"
              />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm hover:bg-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 px-6 py-6">
            <span
              className={clsx(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                visual.tagClass
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {visual.label}
            </span>

            <DialogTitle as="h2" className="normal-case mt-3 text-2xl font-bold text-slate-900">
              {exercise.name}
            </DialogTitle>

            {isPortableTextBlocks(exercise.description) && (
              <PortableText value={exercise.description} components={descriptionComponents} />
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ExerciseTimer key={exercise.id} />
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                <VideoCameraIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Video</p>
                  <p className="text-xs text-slate-400">Coming soon</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {exercise.hasLeftRight ? (
                <LeftRightToggle
                  key={exercise.id}
                  exerciseId={exercise.id}
                  isCompleted={isCompleted}
                  completedAt={completedAt}
                  onCompleted={handleCompleted}
                />
              ) : (
                <CompleteExerciseButton
                  exerciseId={exercise.id}
                  isCompleted={isCompleted}
                  completedAt={completedAt}
                  onComplete={handleCompleted}
                />
              )}
              {completionMessage && (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-700">
                  {completionMessage}
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
