-- This migration was originally applied directly against the database
-- (recorded in _prisma_migrations) without ever being committed to the repo.
-- Recreated here, guarded so it's a no-op if the column already exists, to
-- repair migration history so `prisma migrate dev` can replay it cleanly.

-- AlterTable users - Add column only if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "stripeCustomerId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
