import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Query exerciseCompletions for specific user
    const exercises = await prisma.exerciseCompletion.findMany({
      where: {
        userId: 'cm5jxh8kp0000l4ufuf3xc1zj'
      },
      orderBy: {
        createdAt: 'desc'  // Changed to sort by creation date
      },
      take: 5
    })
    
    // Get total count of user's exercise completions
    const totalCount = await prisma.exerciseCompletion.count({
      where: {
        userId: 'cm5jxh8kp0000l4ufuf3xc1zj'
      }
    })
    
    return NextResponse.json({
      message: 'Exercise completions fetched successfully',
      data: exercises,
      count: exercises.length,
      totalCount
    })
  } catch (error) {
    console.error('Prisma test query failed:', error)
    return NextResponse.json(
      { error: 'Failed to execute Prisma test query' },
      { status: 500 }
    )
  }
} 