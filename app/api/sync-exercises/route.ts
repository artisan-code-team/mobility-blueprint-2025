import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { prisma } from '@/lib/prisma'

interface SanityExercise {
  _id: string
  name: string
  description?: string
  imageUrl?: string
  category: string
  subCategory?: string
}

/**
 * Syncs a single exercise between Sanity CMS and the Postgres database.
 * 
 * This function:
 * 1. Fetches the exercise data from Sanity CMS using the provided ID
 * 2. If the exercise no longer exists in Sanity, deletes it from Postgres
 * 3. If the exercise exists, creates or updates it in Postgres with the latest Sanity data
 * 
 * @param exerciseId - The Sanity _id of the exercise to sync
 * @returns The synced exercise data from Postgres, or null if the exercise was deleted
 */
async function syncExercise(exerciseId: string) {
  const exercise = await client.fetch(`*[_type == "exercise" && _id == $id][0]{
    _id,
    name,
    description,
    "imageUrl": image.asset->url,
    category,
    subCategory
  }`, { id: exerciseId })

  if (!exercise) {
    // If exercise doesn't exist in Sanity, delete it from Postgres
    await prisma.exercise.delete({
      where: { sanityId: exerciseId }
    }).catch(() => {
      // Ignore if already deleted
      console.log(`Exercise ${exerciseId} not found in Sanity, skipping delete operation`)
    })
    return null
  }

  // Upsert the exercise in Postgres
  return await prisma.exercise.upsert({
    where: { sanityId: exercise._id },
    update: {
      name: exercise.name,
      description: exercise.description,
      imageUrl: exercise.imageUrl,
      category: exercise.category,
      subCategory: exercise.subCategory,
    },
    create: {
      sanityId: exercise._id,
      name: exercise.name,
      description: exercise.description,
      imageUrl: exercise.imageUrl,
      category: exercise.category,
      subCategory: exercise.subCategory,
    },
  })
}

/**
 * POST endpoint that syncs a single exercise from Sanity CMS to the local database.
 * Receives a webhook payload from Sanity, then syncs the exercise using syncExercise().
 * Returns a success message and the synced exercise data.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate webhook payload
    if (!body._id || body._type !== 'exercise') {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    // Handle the exercise sync
    const result = await syncExercise(body._id)
    
    if (!result) {
      return NextResponse.json({ 
        message: `Exercise ${body._id} was deleted` 
      })
    }

    return NextResponse.json({ 
      message: `Successfully synced exercise ${body._id}`,
      exercise: result
    })
  } catch (error) {
    console.error('Error syncing exercise:', error)
    return NextResponse.json(
      { error: 'Failed to sync exercise' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint that syncs all exercises from Sanity CMS to the local database.
 * Fetches all exercises from Sanity, then syncs each one individually using syncExercise().
 * Returns the total number of exercises synced and a success message.
 * Used to perform a full sync of all exercise data.
 */
export async function GET() {
  try {
    const exercises = await client.fetch(`*[_type == "exercise"]{
      _id,
      name,
      description,
      "imageUrl": image.asset->url,
      category,
      subCategory
    }`)

    const results = await Promise.all(
      exercises.map((exercise: SanityExercise) => syncExercise(exercise._id))
    )

    return NextResponse.json({ 
      message: `Successfully synced ${results.length} exercises`,
      count: results.length 
    })
  } catch (error) {
    console.error('Error syncing exercises:', error)
    return NextResponse.json(
      { error: 'Failed to sync exercises' },
      { status: 500 }
    )
  }
} 