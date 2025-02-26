import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

    // Check if the exercise was completed this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const existingCompletion = await prisma.exerciseCompletion.findFirst({
      where: {
        userId: user.id,
        exerciseId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    if (existingCompletion) {
      return new NextResponse('Exercise already completed this month', { status: 409 })
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