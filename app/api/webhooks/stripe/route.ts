import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionStatus, PricingTier } from '@prisma/client'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const userNumber = session.metadata?.userNumber
  const tier = session.metadata?.tier as PricingTier
  
  if (!userId || !userNumber || !tier) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Update user with subscription info
  await prisma.user.update({
    where: { id: userId },
    data: {
      userNumber: parseInt(userNumber),
      pricingTier: tier,
      subscriptionStart: new Date(),
      // Optimistic grant: mark as ACTIVE immediately after successful checkout.
      // The subsequent customer.subscription.created/updated webhook will finalize period dates.
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    }
  })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) {
    console.error(`User not found for customer ID: ${customerId}`)
    return
  }

  const metadata = subscription.metadata
  const tier = metadata.tier as PricingTier
  const monthlyPriceCents = parseInt(metadata.monthlyPriceCents || '0')

  // Cast subscription to access period properties
  const sub = subscription as Stripe.Subscription & {
    current_period_start: number
    current_period_end: number
    cancel_at_period_end: boolean
  }

  // Update user subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      pricingTier: tier,
      monthlyPriceCents,
      subscriptionStart: new Date(sub.current_period_start * 1000),
      subscriptionEnd: new Date(sub.current_period_end * 1000),
    }
  })

  // Create/update subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: SubscriptionStatus.ACTIVE,
      tier,
      monthlyPriceCents,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: SubscriptionStatus.ACTIVE,
      tier,
      monthlyPriceCents,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    }
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) {
    console.error(`User not found for customer ID: ${customerId}`)
    return
  }

  // Cast subscription to access period properties
  const sub = subscription as Stripe.Subscription & {
    current_period_end: number
  }

  // Update user subscription status to canceled
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: SubscriptionStatus.CANCELED,
      subscriptionEnd: new Date(sub.current_period_end * 1000),
    }
  })

  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELED,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    }
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment succeeded - ensure user has active status
  const customerId = invoice.customer as string
  
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (user && user.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: SubscriptionStatus.ACTIVE }
    })
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // For now, let Stripe handle payment failures
  // We could add grace period logic here in the future
  console.log(`Payment failed for invoice: ${invoice.id}`)
}
