import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Prisma } from '@prisma/client'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    if (!groupSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const isParticipant = groupSession.participants.some(
      (p) => p.userId === user.id,
    )
    if (!isParticipant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    let exercises: {
      id: string
      name: string
      description: Prisma.JsonValue | null
      imageUrl: string | null
      category: string
      subCategory: string | null
    }[] = []

    if (groupSession.exerciseIds.length > 0) {
      exercises = await prisma.exercise.findMany({
        where: { id: { in: groupSession.exerciseIds } },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          category: true,
          subCategory: true,
        },
      })
    }

    return NextResponse.json({
      ...groupSession,
      exercises,
      isLeader: groupSession.leaderId === user.id,
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
