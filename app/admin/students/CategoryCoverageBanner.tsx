'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  getCategoryCoverage,
  type CategorizedStaleness,
  type CoverageStatus,
  type StalenessItem,
} from '@/lib/admin/studentInsights'

interface CategoryCoverageBannerProps {
  studentName: string
  staleness: CategorizedStaleness
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
 *
 * Session-scoped, not history-scoped (CHA-68 follow-up): this is a live
 * tool for a single teaching session, not a record of the student's overall
 * progress (that's what the staleness timeline below it is for). "Covered"
 * means "completed since this session started," where the session starts
 * when the instructor opens this student and runs until they close it or
 * pick a different student — the parent keys this component by studentId so
 * switching students always begins a fresh one. The "Close session" button
 * resets the cutoff to now for a fresh block without touching any
 * completion data.
 */
export function CategoryCoverageBanner({ studentName, staleness }: CategoryCoverageBannerProps) {
  const [sessionStart, setSessionStart] = useState(() => new Date())

  const items = useMemo(() => {
    const isDoneThisSession = (item: StalenessItem) =>
      item.completedAt !== null && item.completedAt.getTime() >= sessionStart.getTime()
    return getCategoryCoverage(staleness, isDoneThisSession)
  }, [staleness, sessionStart])

  return (
    <div
      role="group"
      aria-label={`Fascial line coverage for ${studentName} this session`}
      className="sticky top-0 z-20 mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Coverage</span>
      {items.map((item) => (
        <span
          key={item.value}
          aria-label={`${item.label}: ${STATUS_LABEL[item.status]} this session`}
          title={`${item.label}: ${STATUS_LABEL[item.status]}`}
          className={clsx(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold',
            STATUS_CLASS[item.status]
          )}
        >
          {item.abbreviation}
        </span>
      ))}
      <button
        type="button"
        onClick={() => setSessionStart(new Date())}
        className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
      >
        Close session
      </button>
    </div>
  )
}
