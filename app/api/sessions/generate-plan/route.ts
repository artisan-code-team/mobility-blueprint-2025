import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSuggestedExercises } from '@/lib/sessions/suggestions'

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
      return NextResponse.json({ error: 'Only the leader can generate a plan' }, { status: 403 })
    }

    if (groupSession.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Session is not in lobby state' }, { status: 400 })
    }

    const participantIds = groupSession.participants.map((p) => p.userId)

    // Get each participant's suggested exercises and intersect
    const suggestionSets = await Promise.all(
      participantIds.map(async (uid) => {
        const exercises = await getSuggestedExercises(uid)
        return new Set(exercises.map((e) => e.id))
      }),
    )

    let commonIds: Set<string> = suggestionSets[0]
    for (let i = 1; i < suggestionSets.length; i++) {
      commonIds = new Set([...commonIds].filter((id) => suggestionSets[i].has(id)))
    }

    let exerciseIds = [...commonIds]

    // Fallback: if no common exercises, use the leader's restorative suggestions
    if (exerciseIds.length === 0) {
      const leaderSuggestions = await getSuggestedExercises(user.id)
      const restorative = leaderSuggestions.filter(
        (e) => e.category.toLowerCase() === 'restorative',
      )
      exerciseIds = restorative.map((e) => e.id)
    }

    const updated = await prisma.groupSession.update({
      where: { id: sessionId },
      data: {
        exerciseIds,
        status: 'ACTIVE',
      },
    })

    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        category: true,
        subCategory: true,
      },
    })

    return NextResponse.json({ ...updated, exercises })
  } catch (error) {
    console.error('Error generating plan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
