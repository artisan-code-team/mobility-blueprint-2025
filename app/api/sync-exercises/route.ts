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

// Helper function to sync a single exercise
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

// Keep the original sync all endpoint as GET
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