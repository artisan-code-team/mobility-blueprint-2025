import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

// Stripe Price IDs for each tier
export const STRIPE_PRICE_IDS = {
  INNER_CIRCLE: 'price_1RMcyyH4S3TZB7VL1rEa0lyq', // $1/month - Users 1-100
  FOUNDER: 'price_1RxcbQH4S3TZB7VLGiWB1tOu',      // $5/month - Users 101-200
  PIONEER: 'price_1RxcdmH4S3TZB7VLHr1fyfg8',      // $10/month - Users 201-300
  STANDARD: 'price_1RxceOH4S3TZB7VLTIyZA5vF',     // $20/month - Users 301+
} as const

// Map pricing tiers to Stripe price IDs
export function getPriceIdForTier(tier: 'INNER_CIRCLE' | 'FOUNDER' | 'PIONEER' | 'STANDARD'): string {
  return STRIPE_PRICE_IDS[tier]
}

// Webhook endpoint secret for verifying webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
