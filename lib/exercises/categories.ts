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

/**
 * The fascial-line taxonomy `subCategory` is scoped to — only exercises
 * under the required categories (Conditioning, Restorative) carry one, per
 * `sanity/schemaTypes/exercise.ts`'s `hidden` rule on that field. This is
 * the "category" instructors mean when talking about coverage at a glance
 * (e.g. CHA-68's admin insights banner) — values and order must match the
 * Sanity `subCategory` options list.
 */
export const FASCIAL_LINE_SUBCATEGORIES = [
  { value: 'lateralLines', abbreviation: 'LL', label: 'Lateral Lines' },
  { value: 'innerLines', abbreviation: 'IL', label: 'Inner Lines' },
  { value: 'frontLine', abbreviation: 'FL', label: 'Front Line' },
  { value: 'backLine', abbreviation: 'BL', label: 'Back Line' },
  { value: 'spiralLine', abbreviation: 'SL', label: 'Spiral Line' },
] as const
