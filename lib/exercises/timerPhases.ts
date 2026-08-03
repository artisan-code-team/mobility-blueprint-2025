export const TIMER_TOTAL_SECONDS = 60

export interface TimerPhase {
  key: string
  label: string
  startSeconds: number
  endSeconds: number
}

export const TIMER_PHASES: TimerPhase[] = [
  { key: 'foundation', label: 'Foundation', startSeconds: 0, endSeconds: 20 },
  { key: 'build', label: 'Build', startSeconds: 20, endSeconds: 40 },
  { key: 'highest', label: 'Highest Level', startSeconds: 40, endSeconds: 48 },
  { key: 'push', label: 'Push', startSeconds: 48, endSeconds: 60 },
]

export function getPhaseForElapsed(elapsedSeconds: number): TimerPhase {
  if (elapsedSeconds >= TIMER_TOTAL_SECONDS) {
    return TIMER_PHASES[TIMER_PHASES.length - 1]
  }
  return (
    TIMER_PHASES.find(
      (phase) => elapsedSeconds >= phase.startSeconds && elapsedSeconds < phase.endSeconds
    ) ?? TIMER_PHASES[0]
  )
}
