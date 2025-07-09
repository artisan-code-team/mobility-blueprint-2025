import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST endpoint that marks an exercise as completed for the authenticated user.
 * 
 * This function:
 * 1. Verifies the user is authenticated via their session
 * 2. Validates the exercise ID from the request body
 * 3. Looks up the user ID from their email
 * 4. Checks if the exercise was completed within the last month
 * 5. Creates an exercise completion record or updates existing one
 * 6. Handles errors like recent completions (409) and authentication issues (401)
 * 
 * @returns The created exercise completion record, or an error response
 */
export async function POST(request: Request) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { exerciseId } = await request.json()
    
    if (!exerciseId) {
      return new NextResponse('Exercise ID is required', { status: 400 })
    }

    // Get the user ID from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 401 })
    }

    // Check if the exercise was completed within the last month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const recentCompletion = await prisma.exerciseCompletion.findFirst({
      where: {
        userId: user.id,
        exerciseId,
        createdAt: {
          gte: oneMonthAgo
        }
      }
    })

    if (recentCompletion) {
      return new NextResponse('Exercise completed within the last month', { status: 409 })
    }

    // Delete any older completion and create a new one
    await prisma.exerciseCompletion.deleteMany({
      where: {
        userId: user.id,
        exerciseId
      }
    })

    const completion = await prisma.exerciseCompletion.create({
      data: {
        userId: user.id,
        exerciseId,
      },
    })

    return NextResponse.json(completion)
  } catch (error) {
    console.error('Error completing exercise:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 