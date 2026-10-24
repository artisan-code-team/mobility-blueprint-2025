// One-off audit: compares every user's `subscriptionStatus` against their
// actual Stripe subscriptions and reports the ones that have drifted. See
// CHA-22 — the webhook previously failed on cancellation, leaving canceled
// students marked ACTIVE.
//
// A user counts as ACTIVE if any of their Stripe subscriptions is active,
// trialing, or past_due (same mapping as app/api/webhooks/stripe/route.ts);
// otherwise CANCELED.
//
// Usage:
//   node --env-file=.env.local scripts/audit-subscription-status.mjs           # dry run, prints mismatches
//   node --env-file=.env.local scripts/audit-subscription-status.mjs --commit   # also writes the Stripe-derived status to users.subscriptionStatus
//
// Requires DATABASE_URL and STRIPE_SECRET_KEY in the environment.

import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const commit = process.argv.includes('--commit')
const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const ACTIVE_STRIPE_STATUSES = new Set(['active', 'trialing', 'past_due'])

async function main() {
  const users = await prisma.user.findMany({
    where: { stripeCustomerId: { not: null } },
    select: { id: true, email: true, stripeCustomerId: true, subscriptionStatus: true },
  })

  console.log(`Auditing ${users.length} user(s) with a Stripe customer ID.`)

  let mismatches = 0
  for (const user of users) {
    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 100,
    })
    const expected = subs.data.some((s) => ACTIVE_STRIPE_STATUSES.has(s.status))
      ? 'ACTIVE'
      : 'CANCELED'

    if (user.subscriptionStatus === expected) continue

    mismatches++
    const stripeStatuses = subs.data.map((s) => s.status).join(', ') || 'no subscriptions'
    console.log(
      `MISMATCH ${user.email ?? user.id}: db=${user.subscriptionStatus ?? 'null'} stripe=${expected} (${stripeStatuses})`
    )

    if (commit) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: expected },
      })
    }
  }

  console.log(
    commit
      ? `Updated ${mismatches} user(s).`
      : `Dry run: ${mismatches} mismatch(es). Re-run with --commit to apply.`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
