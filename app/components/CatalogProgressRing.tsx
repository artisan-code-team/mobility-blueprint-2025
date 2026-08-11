import { getCatalogProgress } from '@/lib/exercises/progress'

interface CatalogProgressRingProps {
  userId: string
}

const SIZE = 144
const STROKE_WIDTH = 12
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Dashboard stat card showing this month's progress through the required
 * plan: how many distinct Conditioning and Restorative exercises this user has
 * completed within the last 30 days, out of the plan's total size, as a
 * circular progress indicator. Bonus categories are excluded — see
 * `getCatalogProgress` for why.
 */
export async function CatalogProgressRing({ userId }: CatalogProgressRingProps) {
  const { completedCount, totalCount } = await getCatalogProgress(userId)

  const hasCatalog = totalCount > 0
  const percent = hasCatalog ? Math.min(completedCount / totalCount, 1) : 0
  const remaining = Math.max(totalCount - completedCount, 0)
  const isComplete = hasCatalog && completedCount >= totalCount
  const dashOffset = CIRCUMFERENCE * (1 - percent)

  return (
    <div className="mb-8 flex flex-col items-center gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
      <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label={`${completedCount} of ${totalCount} monthly plan exercises completed this month`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-slate-100"
          />
          {percent > 0 && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className={isComplete ? 'text-amber-500' : 'text-blue-600'}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">
            {completedCount}
            <span className="text-base font-medium text-slate-400">/{totalCount}</span>
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            this month
          </span>
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="text-xl font-semibold text-slate-800">This Month&apos;s Progress</h2>
        <p className="mt-1 text-sm text-slate-600">
          {!hasCatalog
            ? 'No exercises in the catalog yet.'
            : isComplete
            ? "You've completed your whole monthly plan. Incredible work!"
            : `${remaining} exercise${remaining === 1 ? '' : 's'} away from completing your monthly plan.`}
        </p>
      </div>
    </div>
  )
}
