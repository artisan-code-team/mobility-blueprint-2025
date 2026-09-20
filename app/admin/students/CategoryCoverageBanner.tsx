import clsx from 'clsx'
import type { CategoryCoverageItem, CoverageStatus } from '@/lib/admin/studentInsights'
import { ROLLING_WINDOW_DAYS } from '@/lib/exercises/rollingWindow'

interface CategoryCoverageBannerProps {
  studentName: string
  items: CategoryCoverageItem[]
}

const STATUS_LABEL: Record<CoverageStatus, string> = {
  full: 'fully covered',
  partial: 'partially covered',
  none: 'needs attention',
}

// `full` is a solid fill (green-700/white, ~5:1 contrast) so it reads at
// arm's length mid-class. `partial` stays the lighter tinted chip — Shaun
// preferred how that one looked over the solid amber-700 fill.
const STATUS_CLASS: Record<CoverageStatus, string> = {
  full: 'bg-green-700 text-white',
  partial: 'bg-amber-100 text-amber-700',
  none: 'bg-slate-200 text-slate-500',
}

/**
 * Small, persistent (sticky) row of fascial-line abbreviations so an
 * instructor reviewing a student always knows at a glance which lines still
 * need attention, without scrolling back up through the timeline below it.
 * Three-state per line (see `CoverageStatus`) so checking off just one
 * exercise on either side registers immediately as `partial`, rather than
 * only lighting up once every exercise in the line is done.
 */
export function CategoryCoverageBanner({ studentName, items }: CategoryCoverageBannerProps) {
  return (
    <div
      role="group"
      aria-label={`Fascial line coverage for ${studentName}`}
      className="sticky top-0 z-20 mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Coverage</span>
      {items.map((item) => (
        <span
          key={item.value}
          aria-label={`${item.label}: ${STATUS_LABEL[item.status]} in the last ${ROLLING_WINDOW_DAYS} days`}
          title={`${item.label}: ${STATUS_LABEL[item.status]}`}
          className={clsx(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold',
            STATUS_CLASS[item.status]
          )}
        >
          {item.abbreviation}
        </span>
      ))}
    </div>
  )
}
