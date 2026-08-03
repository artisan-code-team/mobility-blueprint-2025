import type { ComponentType, SVGProps } from 'react'
import {
  ArrowsRightLeftIcon,
  ArrowsPointingInIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  SparklesIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'

export type ExerciseVisual = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badgeClass: string
  tagClass: string
  label: string
}

const SUBCATEGORY_VISUALS: Record<string, ExerciseVisual> = {
  lateralLines: { icon: ArrowsRightLeftIcon, badgeClass: 'bg-sky-500', tagClass: 'bg-sky-50 text-sky-700', label: 'Lateral Lines' },
  innerLines: { icon: ArrowsPointingInIcon, badgeClass: 'bg-violet-500', tagClass: 'bg-violet-50 text-violet-700', label: 'Inner Lines' },
  frontLine: { icon: ArrowUpIcon, badgeClass: 'bg-amber-500', tagClass: 'bg-amber-50 text-amber-700', label: 'Front Line' },
  backLine: { icon: ArrowDownIcon, badgeClass: 'bg-rose-500', tagClass: 'bg-rose-50 text-rose-700', label: 'Back Line' },
  spiralLine: { icon: ArrowPathIcon, badgeClass: 'bg-fuchsia-500', tagClass: 'bg-fuchsia-50 text-fuchsia-700', label: 'Spiral Line' },
}

const CATEGORY_VISUALS: Record<string, ExerciseVisual> = {
  conditioning: { icon: SparklesIcon, badgeClass: 'bg-blue-600', tagClass: 'bg-blue-50 text-blue-700', label: 'Conditioning' },
  restorative: { icon: MoonIcon, badgeClass: 'bg-teal-600', tagClass: 'bg-teal-50 text-teal-700', label: 'Restorative' },
}

const DEFAULT_VISUAL: ExerciseVisual = {
  icon: SparklesIcon,
  badgeClass: 'bg-slate-500',
  tagClass: 'bg-slate-100 text-slate-700',
  label: 'Exercise',
}

export function getExerciseVisual(category: string, subCategory: string | null): ExerciseVisual {
  if (subCategory && SUBCATEGORY_VISUALS[subCategory]) return SUBCATEGORY_VISUALS[subCategory]
  return CATEGORY_VISUALS[category] ?? DEFAULT_VISUAL
}
