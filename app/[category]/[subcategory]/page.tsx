import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import Image from 'next/image'

// Define valid categories and subcategories based on our schema
const validCategories = ['conditioning', 'restorative']
const validSubcategories = ['lateralLines', 'innerLines', 'frontLine', 'backLine', 'spiralLine']

function toCamelCase(str: string): string {
  return str
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

interface ExerciseData {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
}

type PageParams = {
  params: Promise<{ category: string; subcategory: string }>
}

export default async function ExercisesPage({ params }: PageParams) {
  const { category, subcategory } = await params
  
  // Convert kebab-case URL parameter to camelCase for database query
  const camelSubcategory = toCamelCase(subcategory)

  // Validate the category and subcategory
  if (!validCategories.includes(category) || !validSubcategories.includes(camelSubcategory)) {
    notFound()
  }

  // Get the current user's session
  await getServerSession(authConfig)
  
  // Fetch exercises from Postgres
  const exercises = await prisma.exercise.findMany({
    where: {
      category,
      subCategory: camelSubcategory,
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      // We'll add this once we implement exercise completions
      // completions: {
      //   where: {
      //     userId: session?.user?.id
      //   }
      // }
    },
    orderBy: {
      name: 'asc',
    },
  })

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
  const subcategoryTitle = camelSubcategory
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">{categoryTitle}</h1>
        <h2 className="text-2xl text-slate-600">{subcategoryTitle}</h2>
      </div>

      {exercises.length === 0 ? (
        <p className="text-slate-600">No exercises found for this category.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise: ExerciseData) => (
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
                {exercise.description && (
                  <p className="mt-2 text-sm text-slate-600">{exercise.description}</p>
                )}
                {/* We'll add completion status UI here once implemented */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 