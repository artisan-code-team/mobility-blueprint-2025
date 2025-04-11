import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'

/**
 * GET endpoint that retrieves exercises filtered by category and subcategory.
 * 
 * This function:
 * 1. Validates that both category and subcategory query parameters are provided
 * 2. Verifies user authentication via session
 * 3. Queries the database for matching exercises
 * 4. Returns exercises sorted alphabetically by name, including their id, name, description and imageUrl
 * 
 * @returns JSON response with filtered exercises, or error if parameters missing/invalid
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')

    if (!category || !subcategory) {
      return NextResponse.json(
        { error: 'Category and subcategory are required' },
        { status: 400 }
      )
    }

    // Get the current user's session
    await getServerSession(authConfig)

    // Query exercises matching the category and subcategory, selecting only needed fields
    // and sorting alphabetically by name for consistent ordering
    const exercises = await prisma.exercise.findMany({
      where: {
        category,
        subCategory: subcategory,
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
} 