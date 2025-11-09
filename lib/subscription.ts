import { prisma } from './prisma'
import { SubscriptionStatus, PricingTier } from '@prisma/client'

/**
 * Get the current pricing tier and user number for new subscriptions
 */
export async function getCurrentPricingTier(): Promise<{
  tier: PricingTier
  price: number
  userNumber: number
  spotsLeft: number
}> {
  const subscribedUserCount = await prisma.user.count({
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE
    }
  })

  const nextUserNumber = subscribedUserCount + 1

  if (nextUserNumber <= 100) {
    return {
      tier: PricingTier.INNER_CIRCLE,
      price: 100, // $1.00
      userNumber: nextUserNumber,
      spotsLeft: 100 - subscribedUserCount
    }
  } else if (nextUserNumber <= 200) {
    return {
      tier: PricingTier.FOUNDER,
      price: 500, // $5.00
      userNumber: nextUserNumber,
      spotsLeft: 200 - subscribedUserCount
    }
  } else if (nextUserNumber <= 300) {
    return {
      tier: PricingTier.PIONEER,
      price: 1000, // $10.00
      userNumber: nextUserNumber,
      spotsLeft: 300 - subscribedUserCount
    }
  } else {
    return {
      tier: PricingTier.STANDARD,
      price: 2000, // $20.00
      userNumber: nextUserNumber,
      spotsLeft: 0 // Unlimited
    }
  }
}

/**
 * Check if a user has an active subscription
 */
export async function checkSubscriptionAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionStatus: true,
      subscriptionEnd: true 
    }
  })
  
  // User has active subscription
  if (user?.subscriptionStatus === SubscriptionStatus.ACTIVE) {
    return true
  }
  
  // User canceled but still has time left in billing period
  if (user?.subscriptionStatus === SubscriptionStatus.CANCELED && 
      user?.subscriptionEnd && 
      user.subscriptionEnd > new Date()) {
    return true
  }
  
  return false
}

/**
 * Get pricing tier display information
 */
export function getPricingTierInfo(tier: PricingTier) {
  switch (tier) {
    case PricingTier.INNER_CIRCLE:
      return {
        name: 'Inner Circle',
        description: 'Exclusive access for the first 100 members',
        price: 100,
        userRange: '1-100'
      }
    case PricingTier.FOUNDER:
      return {
        name: 'Founder',
        description: 'Founder pricing for visionaries',
        price: 500,
        userRange: '101-200'
      }
    case PricingTier.PIONEER:
      return {
        name: 'Pioneer', 
        description: 'Pioneer pricing for early adopters',
        price: 1000,
        userRange: '201-300'
      }
    case PricingTier.STANDARD:
      return {
        name: 'Standard',
        description: 'Full access to Mobility Blueprint',
        price: 2000,
        userRange: '301+'
      }
  }
}
