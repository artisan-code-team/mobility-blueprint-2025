import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'

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
        // We'll add this once we implement exercise completions
        // completions: {
        //   where: {
        //     userId: session?.user?.id
        //   }
        // }
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