/**
 * Prominent celebratory callout when the subscriber has logged at least one
 * completion within the rolling month window for every exercise in the catalog.
 */
export function MonthCompletionCelebration() {
  return (
    <div
      className="relative mb-10 overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8 shadow-lg ring-1 ring-amber-100/80"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-rose-200/35 blur-2xl"
        aria-hidden
      />

      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-800/90">
          Milestone
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          <span className="mr-2 inline-block" aria-hidden>
            🎉
          </span>
          Congratulations!
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-800">
          You have completed all of your exercises this month—every movement in
          your Mobility Blueprint has a fresh completion in your rolling window.
        </p>
        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-700">
          Go out and move your body in any way that feels good to you.
        </p>
      </div>
    </div>
  )
}
