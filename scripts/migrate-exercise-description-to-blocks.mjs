// One-off migration: converts the `exercise.description` field in Sanity
// from a plain string to a Portable Text block array, to match the schema
// change in sanity/schemaTypes/exercise.ts (rich text description).
//
// Usage:
//   node --env-file=.env.local scripts/migrate-exercise-description-to-blocks.mjs           # dry run, prints what would change
//   node --env-file=.env.local scripts/migrate-exercise-description-to-blocks.mjs --commit   # actually patches the documents
//
// Requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and a
// write-enabled NEXT_PUBLIC_SANITY_TOKEN in the environment (same vars
// sanity/lib/client.ts uses).

import { createClient } from 'next-sanity'
import { randomUUID } from 'node:crypto'

const commit = process.argv.includes('--commit')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-13'
const token = process.env.NEXT_PUBLIC_SANITY_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or NEXT_PUBLIC_SANITY_TOKEN in the environment.'
  )
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function stringToBlocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => ({
      _type: 'block',
      _key: randomUUID(),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: randomUUID(),
          text: paragraph.replace(/\\n/g, '\n'),
          marks: [],
        },
      ],
    }))
}

async function main() {
  const exercises = await client.fetch(`*[_type == "exercise" && defined(description)]{_id, name, description}`)
  const legacy = exercises.filter((exercise) => typeof exercise.description === 'string')

  console.log(`Found ${exercises.length} exercises with a description, ${legacy.length} still plain text.`)

  if (legacy.length === 0) {
    console.log('Nothing to migrate.')
    return
  }

  for (const exercise of legacy) {
    const blocks = stringToBlocks(exercise.description)
    console.log(`\n${exercise.name} (${exercise._id})`)
    console.log('  before:', JSON.stringify(exercise.description))
    console.log('  after: ', JSON.stringify(blocks.map((b) => b.children[0].text)))

    if (commit) {
      await client.patch(exercise._id).set({ description: blocks }).commit()
      console.log('  -> patched')
    }
  }

  if (!commit) {
    console.log('\nDry run only — rerun with --commit to apply these patches.')
  } else {
    console.log(`\nPatched ${legacy.length} exercises.`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
