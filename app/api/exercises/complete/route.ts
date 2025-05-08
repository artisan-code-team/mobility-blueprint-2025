import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * POST endpoint that marks an exercise as completed for the authenticated user.
 * 
 * This function:
 * 1. Verifies the user is authenticated via their session
 * 2. Validates the exercise ID from the request body
 * 3. Looks up the user ID from their email
 * 4. Creates an exercise completion record linking the user and exercise
 * 5. Handles errors like duplicate completions (409) and authentication issues (401)
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

    const completion = await prisma.exerciseCompletion.create({
      data: {
        userId: user.id,
        exerciseId,
      },
    })

    return NextResponse.json(completion)
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse('Exercise already completed', { status: 409 })
    }
    console.error('Error completing exercise:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 