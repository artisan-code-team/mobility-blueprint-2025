import Link from 'next/link'
import { notFound } from 'next/navigation'

const validCategories = ['conditioning', 'restorative']
const validSubcategories = ['lateralLines', 'innerLines', 'frontLine', 'backLine', 'spiralLine']

// URL conversion utility
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  if (!validCategories.includes(category)) {
    notFound()
  }

  return (
    <div>
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-lg font-semibold text-slate-800 hover:text-blue-600"
              >
                Mobility Blueprint
              </Link>
              <div className="hidden md:flex md:space-x-6">
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
                      href={`/${category}/${toKebabCase(subcategory)}`}
                      className="text-sm font-medium text-slate-600 hover:text-blue-600"
                    >
                      {title}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
} 