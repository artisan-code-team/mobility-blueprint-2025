import Link from 'next/link'
import { notFound } from 'next/navigation'

const validCategories = ['conditioning', 'restorative']
const validSubcategories = ['lateralLines', 'innerLines', 'frontLine', 'backLine', 'spiralLine']

interface Props {
  params: {
    category: string
  }
}

export function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }))
}

export default function CategoryPage({ params }: Props) {
  const { category } = params

  if (!validCategories.includes(category)) {
    notFound()
  }

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-slate-800">{categoryTitle} Exercises</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {validSubcategories.map((subcategory) => {
          const title = subcategory
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          return (
            <Link
              key={subcategory}
              href={`/${category}/${subcategory}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                View all {categoryTitle.toLowerCase()} exercises for {title.toLowerCase()}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 