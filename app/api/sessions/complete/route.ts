import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authConfig)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const groupSession = await prisma.groupSession.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    })

    if (!groupSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (groupSession.leaderId !== user.id) {
      return NextResponse.json({ error: 'Only the leader can complete a session' }, { status: 403 })
    }

    if (groupSession.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Session is not active' }, { status: 400 })
    }

    const participantIds = groupSession.participants.map((p) => p.userId)

    // Group session may include moves someone already completed this month; we still
    // write a row for every participant so the completion date "bumps" forward.
    for (const userId of participantIds) {
      for (const exerciseId of groupSession.exerciseIds) {
        await prisma.exerciseCompletion.deleteMany({
          where: { userId, exerciseId },
        })
        await prisma.exerciseCompletion.create({
          data: { userId, exerciseId },
        })
      }
    }

    const updated = await prisma.groupSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error completing session:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
