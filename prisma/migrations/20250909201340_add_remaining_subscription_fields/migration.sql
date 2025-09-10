d -- CreateEnum (only if not exists)
DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PricingTier" AS ENUM ('INNER_CIRCLE', 'FOUNDER', 'PIONEER', 'STANDARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable users - Add columns only if they don't exist
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "subscriptionStatus" "SubscriptionStatus";
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "pricingTier" "PricingTier";
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "monthlyPriceCents" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "userNumber" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "subscriptionStart" TIMESTAMP(3);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "subscriptionEnd" TIMESTAMP(3);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- CreateTable subscriptions (only if not exists)
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "tier" "PricingTier" NOT NULL,
    "monthlyPriceCents" INTEGER NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if not exists)
DO $$ BEGIN
    CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX "users_userNumber_key" ON "users"("userNumber");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- AddForeignKey (only if not exists)
DO $$ BEGIN
    ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
