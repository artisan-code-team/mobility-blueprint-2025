import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { ROLLING_WINDOW_SQL_INTERVAL } from '@/lib/exercises/rollingWindow'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { CompleteExerciseButton } from '@/app/components/CompleteExerciseButton'
import { ExerciseDirections } from '@/app/components/ExerciseDirections'
import { getExerciseVisual } from '@/app/components/exerciseVisuals'

const validCategories = ['conditioning', 'restorative']
const validSubcategories = ['lateralLines', 'innerLines', 'frontLine', 'backLine', 'spiralLine']

type PageParams = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ subcategory?: string }>
}

interface ExerciseWithCompletions {
  id: string
  name: string
  description: Prisma.JsonValue | null
  imageUrl: string | null
  subCategory: string | null
  isCompleted: boolean
  completedAt: Date | null
}

export default async function CategoryPage({ params, searchParams }: PageParams) {
  const { category } = await params
  const { subcategory } = await searchParams

  if (!validCategories.includes(category)) {
    notFound()
  }

  if (subcategory && !validSubcategories.includes(subcategory)) {
    notFound()
  }

  const session = await getServerSession(authConfig)

  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect('/sign-in')
  }

  const exercises = subcategory
    ? await prisma.$queryRaw<ExerciseWithCompletions[]>`
        SELECT
          e.id,
          e.name,
          e.description,
          e."imageUrl",
          e."subCategory",
          CASE
            WHEN ec.id IS NOT NULL AND ec."createdAt" >= NOW() - ${Prisma.raw(ROLLING_WINDOW_SQL_INTERVAL)}
            THEN true
            ELSE false
          END as "isCompleted",
          ec."createdAt" as "completedAt"
        FROM exercises e
        LEFT JOIN exercise_completions ec ON e.id = ec."exerciseId"
          AND ec."userId" = ${user.id}
        WHERE e.category = ${category}
          AND e."subCategory" = ${subcategory}
        ORDER BY e.name ASC
      `
    : await prisma.$queryRaw<ExerciseWithCompletions[]>`
        SELECT
          e.id,
          e.name,
          e.description,
          e."imageUrl",
          e."subCategory",
          CASE
            WHEN ec.id IS NOT NULL AND ec."createdAt" >= NOW() - ${Prisma.raw(ROLLING_WINDOW_SQL_INTERVAL)}
            THEN true
            ELSE false
          END as "isCompleted",
          ec."createdAt" as "completedAt"
        FROM exercises e
        LEFT JOIN exercise_completions ec ON e.id = ec."exerciseId"
          AND ec."userId" = ${user.id}
        WHERE e.category = ${category}
        ORDER BY e.name ASC
      `

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold text-slate-800">{categoryTitle} Exercises</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={`/${category}`}
          className={clsx(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            !subcategory
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
          )}
        >
          All
        </Link>
        {validSubcategories.map((sub) => {
          const visual = getExerciseVisual(category, sub)
          const isActive = subcategory === sub

          return (
            <Link
              key={sub}
              href={`/${category}?subcategory=${sub}`}
              className={clsx(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? clsx(visual.badgeClass, 'text-white')
                  : clsx(visual.tagClass, 'ring-1 ring-inset ring-slate-200 hover:brightness-95')
              )}
            >
              {visual.label}
            </Link>
          )
        })}
      </div>

      {exercises.length === 0 ? (
        <p className="text-slate-600">No exercises found for this filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              {exercise.imageUrl && (
                <div className="relative aspect-square w-full">
                  <Image
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-800">{exercise.name}</h3>
                <ExerciseDirections
                  description={exercise.description}
                  paragraphClassName="mt-2 text-sm text-slate-600"
                  className="mt-2"
                />
                <CompleteExerciseButton
                  exerciseId={exercise.id}
                  isCompleted={exercise.isCompleted}
                  completedAt={exercise.completedAt}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
