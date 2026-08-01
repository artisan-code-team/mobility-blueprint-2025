import { prisma } from '@/lib/prisma'

const DAY_MS = 1000 * 60 * 60 * 24

export type StudentSummary = {
  id: string
  name: string | null
  email: string | null
}

export type StalenessItem = {
  id: string
  name: string
  imageUrl: string | null
  category: string
  subCategory: string | null
  /** Days since the student last completed this exercise, or null if never completed. */
  daysSince: number | null
}

export type CategorizedStaleness = {
  conditioning: StalenessItem[]
  restorative: StalenessItem[]
}

/**
 * All students, for the instructor's student/benchmark pickers.
 */
export async function listStudents(): Promise<StudentSummary[]> {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  })
}

/**
 * Per-student staleness ranking: every catalog exercise annotated with days
 * since the student last completed it (null = never completed), split by
 * category and sorted oldest/never-completed first within each.
 *
 * Query logic mirrors scripts/triangulate-class-2026-07-28.mjs and
 * scripts/triangulate-shared-2026-07-28.mjs, generalized from a fixed trio of
 * named students to a single arbitrary student.
 */
export async function getStudentStaleness(userId: string): Promise<CategorizedStaleness> {
  const [allExercises, completions] = await Promise.all([
    prisma.exercise.findMany({
      select: { id: true, name: true, imageUrl: true, category: true, subCategory: true },
    }),
    prisma.exerciseCompletion.findMany({
      where: { userId },
      select: { exerciseId: true, createdAt: true },
    }),
  ])

  const completedAtByExercise = new Map(completions.map((c) => [c.exerciseId, c.createdAt]))
  const now = new Date()

  const items: StalenessItem[] = allExercises.map((ex) => {
    const completedAt = completedAtByExercise.get(ex.id)
    const daysSince = completedAt ? Math.floor((now.getTime() - completedAt.getTime()) / DAY_MS) : null
    return {
      id: ex.id,
      name: ex.name,
      imageUrl: ex.imageUrl,
      category: ex.category,
      subCategory: ex.subCategory,
      daysSince,
    }
  })

  // Never-completed (null) is maximally stale, so it sorts to the front,
  // followed by completions in descending order of days-since (oldest first).
  const sortOldestFirst = (a: StalenessItem, b: StalenessItem) => {
    const aVal = a.daysSince ?? Infinity
    const bVal = b.daysSince ?? Infinity
    return bVal - aVal
  }

  return {
    conditioning: items.filter((i) => i.category === 'conditioning').sort(sortOldestFirst),
    restorative: items.filter((i) => i.category === 'restorative').sort(sortOldestFirst),
  }
}
