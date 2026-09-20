// One-off cleanup: removes `exercises` rows that were synced from a Sanity
// draft document (`sanityId` starting with `drafts.`) when a published
// counterpart of the same document already exists as its own row. See
// CHA-63 — the sync route previously upserted drafts under their own
// sanityId instead of skipping them, producing duplicate rows.
//
// Usage:
//   node --env-file=.env.local scripts/cleanup-duplicate-draft-exercises.mjs           # dry run, prints what would be deleted
//   node --env-file=.env.local scripts/cleanup-duplicate-draft-exercises.mjs --commit   # actually deletes the draft-duplicate rows
//
// Requires DATABASE_URL in the environment (same var lib/prisma.ts uses).

import { PrismaClient } from '@prisma/client'

const commit = process.argv.includes('--commit')
const prisma = new PrismaClient()

async function main() {
  const drafts = await prisma.exercise.findMany({
    where: { sanityId: { startsWith: 'drafts.' } },
  })

  console.log(`Found ${drafts.length} exercise row(s) synced from a Sanity draft.`)

  let deleted = 0
  for (const draft of drafts) {
    const publishedId = draft.sanityId.replace(/^drafts\./, '')
    const published = await prisma.exercise.findUnique({ where: { sanityId: publishedId } })

    if (!published) {
      console.log(`  skip: ${draft.name} (${draft.sanityId}) has no published counterpart yet`)
      continue
    }

    console.log(`  duplicate: ${draft.name} — draft row ${draft.id} (${draft.sanityId}) vs published row ${published.id} (${published.sanityId})`)

    if (commit) {
      await prisma.exercise.delete({ where: { id: draft.id } })
      console.log('    -> deleted draft row')
    }
    deleted += 1
  }

  if (!commit) {
    console.log(`\nDry run only — ${deleted} row(s) would be deleted. Rerun with --commit to apply.`)
  } else {
    console.log(`\nDeleted ${deleted} duplicate draft row(s).`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
