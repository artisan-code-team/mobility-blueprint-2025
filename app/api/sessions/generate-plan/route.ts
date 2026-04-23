import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEligibleExercises } from '@/lib/sessions/suggestions'

const CATEGORY_TARGET = 5

type CategoryKey = 'conditioning' | 'restorative'

/**
 * For each exercise id, how many participants are still "due" for it
 * (not completed in the last month — i.e. in that user's eligible set).
 */
function buildNeedCounts(eligibleSets: Set<string>[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const set of eligibleSets) {
    for (const id of set) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  return counts
}

/**
 * From the union of all participants' eligible exercises, take up to `target`
 * in `category` with highest need-count first, then name.
 */
function pickTopByCategory(
  exercises: { id: string; name: string; category: string }[],
  needCounts: Map<string, number>,
  category: CategoryKey,
  target: number,
): string[] {
  return exercises
    .filter((e) => e.category.toLowerCase() === category)
    .sort((a, b) => {
      const na = needCounts.get(a.id) ?? 0
      const nb = needCounts.get(b.id) ?? 0
      if (nb !== na) return nb - na
      return a.name.localeCompare(b.name)
    })
    .slice(0, target)
    .map((e) => e.id)
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

    const eligibleSets = await Promise.all(
      participantIds.map(async (uid) => {
        const exercises = await getEligibleExercises(uid)
        return new Set(exercises.map((e) => e.id))
      }),
    )

    const needCounts = buildNeedCounts(eligibleSets)
    const unionIds = new Set(needCounts.keys())

    let exerciseIds: string[] = []

    if (unionIds.size > 0) {
      const pool = await prisma.exercise.findMany({
        where: { id: { in: [...unionIds] } },
        select: { id: true, name: true, category: true },
      })

      exerciseIds = [
        ...pickTopByCategory(
          pool,
          needCounts,
          'conditioning',
          CATEGORY_TARGET,
        ),
        ...pickTopByCategory(
          pool,
          needCounts,
          'restorative',
          CATEGORY_TARGET,
        ),
      ]
    }

    // If union was empty, fall back to leader-only eligible restorative.
    if (exerciseIds.length === 0) {
      const leaderId = groupSession.leaderId
      const leaderEligible = await getEligibleExercises(leaderId)
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
