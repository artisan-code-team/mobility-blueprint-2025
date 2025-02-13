import { prisma } from '@/lib/prisma'
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

async function getSuggestedExercises(userId: string) {
  const exercises = await prisma.$queryRaw<Exercise[]>`
    WITH RankedExercises AS (
      SELECT 
        e.*,
        ROW_NUMBER() OVER (
          PARTITION BY e.category, e."subCategory"
          ORDER BY (SELECT random())
        ) as rn
      FROM exercises e
      WHERE NOT EXISTS (
        SELECT 1 
        FROM exercise_completions ec 
        WHERE e.id = ec."exerciseId" 
        AND ec."userId" = ${userId}
        AND ec."createdAt" >= NOW() - INTERVAL '1 month'
      )
    )
    SELECT id, name, description, "imageUrl", category, "subCategory"
    FROM RankedExercises
    WHERE rn = 1
    ORDER BY category, name;
  `

  return exercises
}

export async function DailySuggestions({ userId }: { userId: string }) {
  const suggestedExercises = await getSuggestedExercises(userId)
  
  const completedExercises = await prisma.exerciseCompletion.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    include: {
      exercise: true,
    },
  })

  const completedExerciseIds = new Set(
    completedExercises.map(completion => completion.exerciseId)
  )

  const exercisesByCategory = suggestedExercises.reduce((acc, exercise) => {
    const category = exercise.category.toLowerCase()
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(exercise)
    return acc
  }, {} as Record<string, Exercise[]>)

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Daily Suggestions</h2>
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
                  className={`flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-white ${
                    completedExerciseIds.has(exercise.id) ? 'bg-green-50' : ''
                  }`}
                >
                  {exercise.imageUrl && (
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-medium text-slate-900">{exercise.name}</h4>
                    {exercise.subCategory && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {exercise.subCategory.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                      </p>
                    )}
                  </div>
                  <CompleteExerciseButton
                    exerciseId={exercise.id}
                    isCompleted={completedExerciseIds.has(exercise.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Completed Exercises</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Object.entries(
          completedExercises.reduce((acc, completion) => {
            const category = completion.exercise.category.toLowerCase()
            if (!acc[category]) {
              acc[category] = []
            }
            acc[category].push(completion)
            return acc
          }, {} as Record<string, typeof completedExercises>)
        ).map(([category, completions]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 capitalize">
              {category}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {completions.map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-green-50"
                >
                  {completion.exercise.imageUrl && (
                    <div className="relative h-16 w-16 flex-shrink-0">
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
                  <CompleteExerciseButton
                    exerciseId={completion.exercise.id}
                    isCompleted={true}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 