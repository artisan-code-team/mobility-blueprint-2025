import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getPriceIdForTier } from '@/lib/stripe'
import { getCurrentPricingTier } from '@/lib/subscription'
import { PricingTier } from '@prisma/client'

export async function POST() {
  try {
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
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription/canceled`,
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

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
