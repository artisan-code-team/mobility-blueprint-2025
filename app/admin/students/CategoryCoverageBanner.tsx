import clsx from 'clsx'
import type { CategoryCoverageItem } from '@/lib/admin/studentInsights'
import { ROLLING_WINDOW_DAYS } from '@/lib/exercises/rollingWindow'

interface CategoryCoverageBannerProps {
  studentName: string
  items: CategoryCoverageItem[]
}

/**
 * Small, persistent (sticky) row of fascial-line abbreviations so an
 * instructor reviewing a student always knows at a glance which lines still
 * need attention, without scrolling back up through the timeline below it.
 */
export function CategoryCoverageBanner({ studentName, items }: CategoryCoverageBannerProps) {
  return (
    <div
      role="group"
      aria-label={`Fascial line coverage for ${studentName}`}
      className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Coverage</span>
      {items.map((item) => (
        <span
          key={item.value}
          aria-label={`${item.label}: ${item.covered ? 'covered' : 'needs attention'} in the last ${ROLLING_WINDOW_DAYS} days`}
          title={`${item.label}: ${item.covered ? 'covered' : 'needs attention'}`}
          className={clsx(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold',
            item.covered ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          )}
        >
          {item.abbreviation}
        </span>
      ))}
    </div>
  )
}
