import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Fetch all exercises from Sanity
    const exercises = await client.fetch(`*[_type == "exercise"]{
      _id,
      name,
      description,
      "imageUrl": image.asset->url,
      category,
      subCategory
    }`)

    // Sync each exercise to Postgres
    for (const exercise of exercises) {
      await prisma.exercise.upsert({
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

    return NextResponse.json({ 
      message: `Successfully synced ${exercises.length} exercises`,
      count: exercises.length 
    })
  } catch (error) {
    console.error('Error syncing exercises:', error)
    return NextResponse.json(
      { error: 'Failed to sync exercises' },
      { status: 500 }
    )
  }
} 