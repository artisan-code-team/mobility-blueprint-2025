-- AlterTable
-- Converts exercises.description from text to jsonb to hold Portable Text
-- (rich text) blocks synced from Sanity. Existing plain-text values are
-- preserved as JSON string scalars (via to_jsonb) rather than dropped, so
-- nothing is lost before the Sanity data migration + resync overwrites them
-- with proper Portable Text block arrays.
ALTER TABLE "public"."exercises"
  ALTER COLUMN "description" TYPE JSONB USING to_jsonb("description");
