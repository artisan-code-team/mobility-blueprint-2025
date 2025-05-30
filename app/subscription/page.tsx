'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/app/components/Button'

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session?.user?.email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Subscribe to Mobility Blueprint
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Get access to all exercises and track your progress with a subscription.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            color="blue"
          >
            {isLoading ? 'Loading...' : 'Subscribe Now'}
          </Button>
        </div>
      </div>
    </div>
  )
} 