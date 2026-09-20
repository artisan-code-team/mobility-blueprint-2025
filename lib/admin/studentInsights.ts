import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { FASCIAL_LINE_SUBCATEGORIES } from '@/lib/exercises/categories'
import { isWithinRollingWindow } from '@/lib/exercises/rollingWindow'

const DAY_MS = 1000 * 60 * 60 * 24

export type StudentSummary = {
  id: string
  name: string | null
  email: string | null
}

export type StalenessItem = {
  id: string
  name: string
  description: Prisma.JsonValue | null
  imageUrl: string | null
  category: string
  subCategory: string | null
  hasLeftRight: boolean
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
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        category: true,
        subCategory: true,
        hasLeftRight: true,
      },
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
      description: ex.description,
      imageUrl: ex.imageUrl,
      category: ex.category,
      subCategory: ex.subCategory,
      hasLeftRight: ex.hasLeftRight,
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

/**
 * `none` — no completion in this line within the window on either side.
 * `partial` — one side (conditioning or restorative) has a completion within
 * the window but the other doesn't; this is the immediate "yes, that just
 * registered" feedback Shaun wants right after checking off an exercise,
 * without needing the other side done too.
 * `full` — both sides covered within the window (or the line has no catalog
 * exercises on a side at all, which can't be held against it).
 */
export type CoverageStatus = 'none' | 'partial' | 'full'

export type CategoryCoverageItem = {
  value: string
  abbreviation: string
  label: string
  status: CoverageStatus
}

function lineStatus(itemsInLine: StalenessItem[]): CoverageStatus {
  const conditioningItems = itemsInLine.filter((i) => i.category === 'conditioning')
  const restorativeItems = itemsInLine.filter((i) => i.category === 'restorative')

  // Only sides that actually have catalog exercises count — a side with zero
  // exercises can't be held against or credited to the student, so it's
  // dropped rather than treated as vacuously "done" (which would let an
  // untouched conditioning-only line read as partial/full just because
  // there's no restorative side to fail).
  const sides = [conditioningItems, restorativeItems].filter((side) => side.length > 0)
  if (sides.length === 0) return 'none'

  const doneSides = sides.filter((side) => side.some((i) => isWithinRollingWindow(i.daysSince)))

  if (doneSides.length === 0) return 'none'
  if (doneSides.length === sides.length) return 'full'
  return 'partial'
}

/**
 * Per-fascial-line coverage for the student's insights banner (CHA-68).
 * The ticket left "what counts as checked off" as an open decision — Shaun's
 * call: he wants to see a completion register immediately (one exercise on
 * either side within the rolling window = `partial`), with `full` reserved
 * for both conditioning and restorative done, so the banner works as a
 * quick during-class glance instead of something he has to scroll the whole
 * timeline to interpret.
 *
 * `subCategory` is optional in the schema, so a conditioning/restorative
 * exercise published without one wouldn't match any known line — rather
 * than silently vanishing from the coverage picture, it's rolled up into a
 * distinct "Uncategorized" entry so the gap stays visible.
 */
export function getCategoryCoverage(staleness: CategorizedStaleness): CategoryCoverageItem[] {
  const items = [...staleness.conditioning, ...staleness.restorative]
  const knownSubCategories = new Set<string>(FASCIAL_LINE_SUBCATEGORIES.map((line) => line.value))

  const lines: CategoryCoverageItem[] = FASCIAL_LINE_SUBCATEGORIES.map(({ value, abbreviation, label }) => {
    const itemsInLine = items.filter((i) => i.subCategory === value)
    return { value, abbreviation, label, status: lineStatus(itemsInLine) }
  })

  const uncategorized = items.filter((i) => !i.subCategory || !knownSubCategories.has(i.subCategory))
  if (uncategorized.length > 0) {
    lines.push({
      value: 'uncategorized',
      abbreviation: '?',
      label: 'Uncategorized',
      status: lineStatus(uncategorized),
    })
  }

  return lines
}
