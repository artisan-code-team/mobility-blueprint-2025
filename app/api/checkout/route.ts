import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getPriceIdForTier } from '@/lib/stripe'
import { getCurrentPricingTier } from '@/lib/subscription'

export async function POST() {
  try {
    const headersList = await headers()
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        stripeCustomerId: true,
        subscriptionStatus: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'ACTIVE') {
      return NextResponse.json({ 
        error: 'User already has an active subscription' 
      }, { status: 400 })
    }

    // Get current pricing tier based on user count
    const currentTier = await getCurrentPricingTier()
    
    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId
    
    // If customer ID exists, verify it exists in Stripe, otherwise try to find by email, then create
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId)
      } catch (error: unknown) {
        const stripeError = error as { code?: string }
        if (stripeError.code === 'resource_missing') {
          console.log('Stripe customer not found by stored ID, attempting lookup by email')
          try {
            const list = await stripe.customers.list({ email: user.email || undefined, limit: 1 })
            const found = list.data[0]
            if (found?.id) {
              customerId = found.id
              await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
              console.log('Linked existing Stripe customer by email:', customerId)
            } else {
              customerId = null // Fall through to creation
            }
          } catch {
            customerId = null
          }
        }
      }
    }
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId: user.id,
          userNumber: currentTier.userNumber.toString(),
          tier: currentTier.tier
        }
      })
      
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Get the appropriate price ID for the current tier
    const priceId = getPriceIdForTier(currentTier.tier)

    // Determine base URL for redirect callbacks
    const protocol = headersList.get('x-forwarded-proto') ?? 'https'
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
    const baseUrlEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = baseUrlEnv || `${protocol}://${host}`

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/canceled`,
      subscription_data: {
        metadata: {
          userId: user.id,
          userNumber: currentTier.userNumber.toString(),
          tier: currentTier.tier,
          monthlyPriceCents: currentTier.price.toString()
        }
      },
      metadata: {
        userId: user.id,
        userNumber: currentTier.userNumber.toString(),
        tier: currentTier.tier
      }
    })

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id 
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Checkout error:', message, error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
