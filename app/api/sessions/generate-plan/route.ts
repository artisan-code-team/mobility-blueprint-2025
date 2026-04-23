import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEligibleExercises } from '@/lib/sessions/suggestions'

const CATEGORY_TARGET = 5

function pickCategory(
  exercises: { id: string; category: string }[],
  category: string,
  targetCount: number,
): string[] {
  return exercises
    .filter((exercise) => exercise.category.toLowerCase() === category)
    .slice(0, targetCount)
    .map((exercise) => exercise.id)
}

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

    // Intersect each participant's full eligible pool (not randomized daily picks)
    // so we can reliably build a larger common plan.
    const eligibleSets = await Promise.all(
      participantIds.map(async (uid) => {
        const exercises = await getEligibleExercises(uid)
        return new Set(exercises.map((e) => e.id))
      }),
    )

    let commonIds: Set<string> = eligibleSets[0] ?? new Set<string>()
    for (let i = 1; i < eligibleSets.length; i++) {
      commonIds = new Set([...commonIds].filter((id) => eligibleSets[i].has(id)))
    }

    const commonExercises = await prisma.exercise.findMany({
      where: { id: { in: [...commonIds] } },
      select: {
        id: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    let exerciseIds = [
      ...pickCategory(commonExercises, 'conditioning', CATEGORY_TARGET),
      ...pickCategory(commonExercises, 'restorative', CATEGORY_TARGET),
    ]

    // Fallback: if the common pool is empty, use the leader's eligible restorative flow.
    if (exerciseIds.length === 0) {
      const leaderEligible = await getEligibleExercises(user.id)
      exerciseIds = leaderEligible
        .filter((e) => e.category.toLowerCase() === 'restorative')
        .slice(0, CATEGORY_TARGET)
        .map((e) => e.id)
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
