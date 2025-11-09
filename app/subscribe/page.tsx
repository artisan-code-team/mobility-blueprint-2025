import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentPricingTier, getPricingTierInfo } from '@/lib/subscription'
import { SubscribeButton } from './SubscribeButton'

export default async function SubscribePage() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true, 
      subscriptionStatus: true,
      pricingTier: true,
      monthlyPriceCents: true 
    }
  })

  if (!user) {
    redirect('/sign-in')
  }

  // If user already has active subscription, redirect to dashboard
  if (user.subscriptionStatus === 'ACTIVE') {
    redirect('/dashboard')
  }

  // Get current pricing tier for new users
  const currentTier = await getCurrentPricingTier()
  const tierInfo = getPricingTierInfo(currentTier.tier)

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Join Mobility Blueprint
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Get access to the complete mobility training platform
          </p>
        </div>

        {/* Current Tier Pricing */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">{tierInfo.name}</h2>
            <p className="mt-2 text-slate-600">{tierInfo.description}</p>
            
            {/* Price Display */}
            <div className="mt-6">
              <span className="text-5xl font-bold text-blue-600">
                ${(currentTier.price / 100).toFixed(0)}
              </span>
              <span className="text-xl text-slate-600">/month</span>
            </div>

            {/* Scarcity Messaging */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                {currentTier.spotsLeft > 0 ? (
                  <>Only {currentTier.spotsLeft} spots left at this price!</>
                ) : (
                  <>You&apos;re user #{currentTier.userNumber}</>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Users {tierInfo.userRange} get {tierInfo.name} pricing
              </p>
            </div>

            {/* Features List */}
            <div className="mt-8 text-left">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                What you get:
              </h3>
              <ul className="space-y-3">
                {[
                  'Complete exercise library with detailed instructions',
                  'Progress tracking and completion analytics', 
                  'Personalized daily exercise recommendations',
                  'Access to all 8 myofascial meridian categories',
                  'Monthly progress reports and insights',
                  'Direct feedback channel for platform improvements',
                  'Lifetime access at your locked-in price'
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe Button */}
            <div className="mt-8">
              <SubscribeButton />
            </div>

            {/* Money Back Guarantee */}
            <p className="mt-4 text-sm text-slate-500">
              30-day money-back guarantee. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Future Pricing Preview */}
        <div className="mt-8 bg-slate-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Future Pricing Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded">
              <div className="font-semibold">Founder (Users 101-200)</div>
              <div className="text-slate-600">$5/month</div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-semibold">Pioneer (Users 201-300)</div>
              <div className="text-slate-600">$10/month</div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-semibold">Standard (Users 301+)</div>
              <div className="text-slate-600">$20/month</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Lock in your price now - it will never increase for existing subscribers
          </p>
        </div>
      </div>
    </div>
  )
}
