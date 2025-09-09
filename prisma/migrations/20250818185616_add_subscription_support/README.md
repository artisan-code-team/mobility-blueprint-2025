# Add Subscription Support Migration

## Overview
This migration adds comprehensive subscription support to enable the 4-tier progressive pricing model:
- Inner Circle: $1/month (Users 1-100)
- Founder: $5/month (Users 101-200)  
- Pioneer: $10/month (Users 201-300)
- Standard: $20/month (Users 301+)

## Changes Made

### New Enums
- `SubscriptionStatus`: ACTIVE, CANCELED
- `PricingTier`: INNER_CIRCLE, FOUNDER, PIONEER, STANDARD

### Users Table Updates
- `stripeCustomerId` (TEXT, UNIQUE) - Links to Stripe customer
- `subscriptionStatus` (SubscriptionStatus) - Current subscription state
- `pricingTier` (PricingTier) - Which tier they locked in at
- `monthlyPriceCents` (INTEGER) - Exact price they're paying
- `userNumber` (INTEGER, UNIQUE) - Sequential numbering for tier assignment
- `subscriptionStart` (TIMESTAMP) - When subscription started
- `subscriptionEnd` (TIMESTAMP) - When subscription ends/canceled

### New Subscriptions Table
Complete subscription tracking with Stripe integration:
- Links to Users via foreign key
- Stores Stripe subscription and price IDs
- Tracks billing periods and cancellation status
- Maintains audit trail of subscription changes

## Deployment Notes

### Pre-Migration Checklist
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Verify Prisma client generation works
- [ ] Confirm no breaking changes to existing queries

### Post-Migration Tasks
- [ ] Update application code to use new subscription fields
- [ ] Set up Stripe webhook endpoints
- [ ] Create admin tools for subscription management
- [ ] Update user authentication flow to check subscription status

### Rollback Plan
If issues arise, the migration can be rolled back by:
1. Dropping the `subscriptions` table
2. Removing the new columns from `users` table  
3. Dropping the new enums
4. Regenerating Prisma client from previous schema

## Business Logic
- Users without `subscriptionStatus = ACTIVE` cannot access dashboard
- `userNumber` determines pricing tier when they first subscribe
- Subscription status is updated via Stripe webhooks
- Local subscription data serves as cache/backup for Stripe data
