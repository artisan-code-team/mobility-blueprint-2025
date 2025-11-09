import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import Link from 'next/link'

export default async function SubscriptionCanceled() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Subscription Canceled
          </h1>
          
          <p className="text-slate-600 mb-6">
            Your subscription process was canceled. No charges were made to your account.
          </p>

          <div className="space-y-3">
            <Link
              href="/subscribe"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600">
              If you experienced any issues during checkout, please contact support or try again. 
              Your pricing tier is held for you!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
