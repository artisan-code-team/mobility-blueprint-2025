import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

// Read Stripe Price IDs from env per environment. Set these in Vercel:
// PREVIEW/DEV: use TEST prices. PRODUCTION: use LIVE prices.
const PRICE_IDS_ENV = {
  INNER_CIRCLE: process.env.STRIPE_PRICE_ID_INNER_CIRCLE,
  FOUNDER: process.env.STRIPE_PRICE_ID_FOUNDER,
  PIONEER: process.env.STRIPE_PRICE_ID_PIONEER,
  STANDARD: process.env.STRIPE_PRICE_ID_STANDARD,
} as const

export function getPriceIdForTier(
  tier: 'INNER_CIRCLE' | 'FOUNDER' | 'PIONEER' | 'STANDARD'
): string {
  const priceId = PRICE_IDS_ENV[tier]
  if (!priceId) {
    throw new Error(`Missing Stripe Price ID for tier ${tier}. Set STRIPE_PRICE_ID_${tier} in env.`)
  }
  return priceId
}

// Webhook endpoint secret for verifying webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
