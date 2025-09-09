import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authConfig } from "@/lib/auth"
import { DailySuggestions } from "../components/DailySuggestions"
import { prisma } from "@/lib/prisma"

/**
 * Categories of exercises available in the app.
 * Each category has:
 * - name: Display name shown to users
 * - slug: URL-friendly identifier used in routing
 * - description: Brief explanation of the category's focus
 */
const categories = [
  {
    name: 'Conditioning',
    slug: 'conditioning',
    description: 'Dynamic exercises to improve mobility and movement patterns',
  },
  {
    name: 'Restorative',
    slug: 'restorative',
    description: 'Gentle exercises focused on recovery and restoration',
  },
]

export default async function Dashboard() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  // Get the user from the database 
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true,
      subscriptionStatus: true,
      subscriptionEnd: true,
      pricingTier: true
    }
  })

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user has an active subscription
  const hasActiveSubscription = user.subscriptionStatus === 'ACTIVE' || 
    (user.subscriptionStatus === 'CANCELED' && 
     user.subscriptionEnd && 
     user.subscriptionEnd > new Date())

  // If no active subscription, redirect to subscribe page
  if (!hasActiveSubscription) {
    redirect('/subscribe')
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
          <p className="mt-2 text-slate-600">
            Signed in as: <span className="font-medium text-slate-900">{session.user.email}</span>
          </p>
        </div>

        <DailySuggestions userId={user.id} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="group block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600">
                {category.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 