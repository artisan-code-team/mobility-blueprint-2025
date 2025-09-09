import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import Link from 'next/link'

function SuccessContent() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to Mobility Blueprint!
          </h1>
          
          <p className="text-slate-600 mb-6">
            Your subscription has been activated successfully. You now have access to the complete mobility training platform.
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/conditioning"
              className="block w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Start Your First Workout
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Explore your personalized dashboard</li>
              <li>• Check out today's recommended exercises</li>
              <li>• Start tracking your progress</li>
              <li>• Join our community for feedback and tips</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function SubscriptionSuccess() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
