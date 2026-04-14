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
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Session code is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const groupSession = await prisma.groupSession.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!groupSession || groupSession.status !== 'LOBBY') {
      return NextResponse.json(
        { error: 'Invalid or expired session code' },
        { status: 400 },
      )
    }

    await prisma.sessionParticipant.upsert({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: groupSession.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        sessionId: groupSession.id,
      },
    })

    const updated = await prisma.groupSession.findUnique({
      where: { id: groupSession.id },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error joining session:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
