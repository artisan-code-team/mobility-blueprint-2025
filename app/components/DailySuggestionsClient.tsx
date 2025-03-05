'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CompleteExerciseButton } from './CompleteExerciseButton'

interface Exercise {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  subCategory: string | null
}

interface DailySuggestionsClientProps {
  initialSuggestedExercises: Exercise[]
  completedExercises: {
    id: string
    exercise: Exercise
  }[]
}

export function DailySuggestionsClient({
  initialSuggestedExercises,
  completedExercises,
}: DailySuggestionsClientProps) {
  const [todaysSuggestedExercises, setTodaysSuggestedExercises] = useState(initialSuggestedExercises)
  const [allExercisesCompleted, setAllExercisesCompleted] = useState(false)

  const completedExerciseIds = new Set(
    completedExercises.map(completion => completion.exercise.id)
  )

  const handleExerciseComplete = (exerciseId: string) => {
    setTodaysSuggestedExercises(prev => {
      const updatedExercises = prev.filter(exercise => exercise.id !== exerciseId)
      if (updatedExercises.length === 0) {
        setAllExercisesCompleted(true)
      }
      return updatedExercises
    })
  }

  const exercisesByCategory = todaysSuggestedExercises.reduce((acc, exercise) => {
    const category = exercise.category.toLowerCase()
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(exercise)
    return acc
  }, {} as Record<string, Exercise[]>)

  const completedExercisesByCategory = completedExercises.reduce((acc, completion) => {
    const category = completion.exercise.category.toLowerCase()
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(completion)
    return acc
  }, {} as Record<string, typeof completedExercises>)

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Daily Suggestions</h2>
      {allExercisesCompleted && (
        <div className="mb-6 p-4 rounded-lg border border-green-200 bg-green-50 text-green-700">
          Congratulations! You have completed all exercises for today!
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Object.entries(exercisesByCategory).map(([category, exercises]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 capitalize">
              {category}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-slate-200 bg-white ${
                    completedExerciseIds.has(exercise.id) ? 'bg-green-50' : ''
                  }`}
                >
                  {exercise.imageUrl && (
                    <div className="relative h-40 w-full sm:h-16 sm:w-16 flex-shrink-0">
                      <Image
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-grow w-full">
                    <h4 className="font-medium text-slate-900">{exercise.name}</h4>
                    {exercise.subCategory && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {exercise.subCategory.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                      </p>
                    )}
                  </div>
                  <div className="w-full sm:w-[300px]">
                    <CompleteExerciseButton
                      exerciseId={exercise.id}
                      isCompleted={completedExerciseIds.has(exercise.id)}
                      onComplete={() => handleExerciseComplete(exercise.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Completed Exercises</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Object.entries(completedExercisesByCategory).map(([category, completions]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 capitalize">
              {category}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {completions.map((completion) => (
                <div
                  key={completion.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-slate-200 bg-green-50"
                >
                  {completion.exercise.imageUrl && (
                    <div className="relative h-40 w-full sm:h-16 sm:w-16 flex-shrink-0">
                      <Image
                        src={completion.exercise.imageUrl}
                        alt={completion.exercise.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-medium text-slate-900">{completion.exercise.name}</h4>
                    {completion.exercise.subCategory && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {completion.exercise.subCategory.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                      </p>
                    )}
                  </div>
                  <div className="w-full sm:w-[300px]">
                    <div className="px-4 py-2 text-center text-green-700 bg-green-100 rounded-md">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}