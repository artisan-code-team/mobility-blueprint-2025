'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ClockIcon, PauseIcon, PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { TIMER_PHASES, TIMER_TOTAL_SECONDS, getPhaseForElapsed } from '@/lib/exercises/timerPhases'

const SIZE = 176
const STROKE_WIDTH = 12
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const TICK_INNER_RADIUS = RADIUS + STROKE_WIDTH / 2 + 2
const TICK_OUTER_RADIUS = RADIUS + STROKE_WIDTH / 2 + 8

type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

const PHASE_STYLES: Record<string, { ringClass: string; labelClass: string }> = {
  foundation: { ringClass: 'text-blue-600', labelClass: 'text-blue-700' },
  build: { ringClass: 'text-emerald-600', labelClass: 'text-emerald-700' },
  highest: { ringClass: 'text-amber-500', labelClass: 'text-amber-600' },
  push: { ringClass: 'text-rose-600', labelClass: 'text-rose-700' },
}

function formatRemaining(remainingSeconds: number) {
  const clamped = Math.max(0, Math.ceil(remainingSeconds))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function tickPoint(boundarySeconds: number, radius: number) {
  const angle = (boundarySeconds / TIMER_TOTAL_SECONDS) * 2 * Math.PI
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

export function ExerciseTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const rafRef = useRef<number | null>(null)
  const startTimestampRef = useRef<number | null>(null)
  const accumulatedSecondsRef = useRef(0)

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (startTimestampRef.current === null) return
    const elapsed = accumulatedSecondsRef.current + (performance.now() - startTimestampRef.current) / 1000

    if (elapsed >= TIMER_TOTAL_SECONDS) {
      setElapsedSeconds(TIMER_TOTAL_SECONDS)
      setStatus('done')
      stopLoop()
      return
    }

    setElapsedSeconds(elapsed)
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop])

  useEffect(() => stopLoop, [stopLoop])

  const handleStart = () => {
    accumulatedSecondsRef.current = 0
    startTimestampRef.current = performance.now()
    setElapsedSeconds(0)
    setStatus('running')
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePause = () => {
    if (startTimestampRef.current !== null) {
      accumulatedSecondsRef.current += (performance.now() - startTimestampRef.current) / 1000
    }
    stopLoop()
    setStatus('paused')
  }

  const handleResume = () => {
    startTimestampRef.current = performance.now()
    setStatus('running')
    rafRef.current = requestAnimationFrame(tick)
  }

  const handleReset = () => {
    stopLoop()
    startTimestampRef.current = null
    accumulatedSecondsRef.current = 0
    setElapsedSeconds(0)
    setStatus('idle')
  }

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
      >
        <ClockIcon className="h-5 w-5 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-700">Timer</p>
          <p className="text-xs text-slate-400">Tap to start — 60 seconds</p>
        </div>
      </button>
    )
  }

  const percent = Math.min(elapsedSeconds / TIMER_TOTAL_SECONDS, 1)
  const dashOffset = CIRCUMFERENCE * (1 - percent)
  const phase = getPhaseForElapsed(elapsedSeconds)
  const phaseStyle = PHASE_STYLES[phase.key]
  const remaining = TIMER_TOTAL_SECONDS - elapsedSeconds

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:col-span-2">
      <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label={`${formatRemaining(remaining)} remaining, ${phase.label} phase`}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-slate-200"
          />
          {percent > 0 && (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className={clsx('transition-colors', phaseStyle.ringClass)}
            />
          )}
          {TIMER_PHASES.slice(1).map((p) => {
            const inner = tickPoint(p.startSeconds, TICK_INNER_RADIUS)
            const outer = tickPoint(p.startSeconds, TICK_OUTER_RADIUS)
            return (
              <line
                key={p.key}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="text-slate-400"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-slate-900">
            {status === 'done' ? '0:00' : formatRemaining(remaining)}
          </span>
          <span className={clsx('text-xs font-semibold uppercase tracking-wide', phaseStyle.labelClass)}>
            {status === 'done' ? 'Done!' : phase.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {status === 'running' && (
          <button
            type="button"
            onClick={handlePause}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
          >
            <PauseIcon className="h-4 w-4" />
            Pause
          </button>
        )}
        {status === 'paused' && (
          <button
            type="button"
            onClick={handleResume}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <PlayIcon className="h-4 w-4" />
            Resume
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {status === 'done' ? 'Start Again' : 'Reset'}
        </button>
      </div>
    </div>
  )
}
