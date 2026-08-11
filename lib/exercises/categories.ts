/**
 * Splits the exercise catalog into the required monthly plan and optional
 * bonus work.
 *
 * Conditioning and Restorative are what keep connective tissue in a state of
 * growth across the rolling 30-day window — those are the plan. Everything
 * else is extra: hidden until a student has finished the plan, and never
 * counted toward their progress ring.
 *
 * Values must match the `category` option list in
 * `sanity/schemaTypes/exercise.ts`. A category present in neither list is
 * unreachable — it will never be suggested and never counted.
 */

export const REQUIRED_CATEGORIES = ['conditioning', 'restorative'] as const

export const BONUS_CATEGORIES = [
  'jointMobility',
  'cardio',
  'upperBodyStrength',
  'lowerBodyStrength',
  'core',
] as const

const BONUS_CATEGORY_SET: ReadonlySet<string> = new Set(BONUS_CATEGORIES)

export function isBonusCategory(category: string): boolean {
  return BONUS_CATEGORY_SET.has(category)
}
