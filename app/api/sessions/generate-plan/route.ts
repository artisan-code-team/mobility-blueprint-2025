import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEligibleExercises } from '@/lib/sessions/suggestions'

const CATEGORY_TARGET = 5

type CategoryKey = 'conditioning' | 'restorative'

type ExerciseRow = {
  id: string
  name: string
  category: string
  subCategory: string | null
}

function subCategoryKey(subCategory: string | null): string {
  return subCategory ?? ''
}

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

function compareByNeed(
  a: ExerciseRow,
  b: ExerciseRow,
  needCounts: Map<string, number>,
): number {
  const na = needCounts.get(a.id) ?? 0
  const nb = needCounts.get(b.id) ?? 0
  if (nb !== na) return nb - na
  return a.name.localeCompare(b.name)
}

/**
 * Up to `target` exercises in `category`: pick the best match per subCategory
 * (highest group need count, then name), order those by need count, take up to
 * `target`, then fill any remaining slots from the rest of the category.
 */
function pickBalancedBySubcategory(
  exercises: ExerciseRow[],
  needCounts: Map<string, number>,
  category: CategoryKey,
  target: number,
): string[] {
  const inCategory = exercises.filter((e) => e.category.toLowerCase() === category)
  const selected = new Set<string>()
  const result: string[] = []

  const bySub = new Map<string, ExerciseRow[]>()
  for (const e of inCategory) {
    const key = subCategoryKey(e.subCategory)
    if (!bySub.has(key)) bySub.set(key, [])
    bySub.get(key)!.push(e)
  }

  const cmp = (a: ExerciseRow, b: ExerciseRow) => compareByNeed(a, b, needCounts)

  const winners: ExerciseRow[] = []
  for (const group of bySub.values()) {
    const sorted = [...group].sort(cmp)
    winners.push(sorted[0]!)
  }

  winners.sort(cmp)

  for (const w of winners) {
    if (result.length >= target) break
    if (!selected.has(w.id)) {
      selected.add(w.id)
      result.push(w.id)
    }
  }

  const rest = inCategory.filter((e) => !selected.has(e.id)).sort(cmp)

  for (const e of rest) {
    if (result.length >= target) break
    result.push(e.id)
  }

  return result
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
        select: { id: true, name: true, category: true, subCategory: true },
      })

      exerciseIds = [
        ...pickBalancedBySubcategory(
          pool,
          needCounts,
          'conditioning',
          CATEGORY_TARGET,
        ),
        ...pickBalancedBySubcategory(
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
      const leaderNeed = new Map<string, number>()
      for (const e of leaderEligible) {
        leaderNeed.set(e.id, 1)
      }
      const leaderPool: ExerciseRow[] = leaderEligible.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        subCategory: e.subCategory,
      }))
      exerciseIds = pickBalancedBySubcategory(
        leaderPool,
        leaderNeed,
        'restorative',
        CATEGORY_TARGET,
      )
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
