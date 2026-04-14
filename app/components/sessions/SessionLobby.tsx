'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Participant {
  id: string
  userId: string
  user: { id: string; name: string | null; email: string | null }
}

interface Exercise {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  subCategory: string | null
}

interface SessionData {
  id: string
  code: string
  leaderId: string
  status: 'LOBBY' | 'ACTIVE' | 'COMPLETED'
  exerciseIds: string[]
  participants: Participant[]
  exercises: Exercise[]
  isLeader: boolean
}

const POLL_INTERVAL = 5000

export function SessionLobby({
  sessionId,
  currentUserId,
}: {
  sessionId: string
  currentUserId: string
}) {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionPending, setActionPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load session')
      }
      const data: SessionData = await res.json()
      setSession(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchSession])

  const handleCopyCode = async () => {
    if (!session) return
    await navigator.clipboard.writeText(session.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGeneratePlan = async () => {
    setActionPending(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate plan')
      }
      await fetchSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionPending(false)
    }
  }

  const handleComplete = async () => {
    setActionPending(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to complete session')
      }
      await fetchSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionPending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading session...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error || 'Session not found'}
      </div>
    )
  }

  const exercisesByCategory = session.exercises.reduce(
    (acc, exercise) => {
      const cat = exercise.category.toLowerCase()
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(exercise)
      return acc
    },
    {} as Record<string, Exercise[]>,
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header with code */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {session.status === 'COMPLETED' ? 'Session Complete' : 'Group Session'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session.isLeader ? 'You are the leader' : 'You are a participant'}
            </p>
          </div>
          {session.status !== 'COMPLETED' && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-5 py-3 transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <span className="font-mono text-2xl font-bold tracking-widest text-slate-900">
                {session.code}
              </span>
              <span className="text-xs text-slate-500">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Participants ({session.participants.length})
        </h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {session.participants.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                {(p.user.name?.[0] || p.user.email?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {p.user.name || p.user.email}
                  {p.userId === session.leaderId && (
                    <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      Leader
                    </span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* LOBBY state — leader action */}
      {session.status === 'LOBBY' && session.isLeader && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <p className="mb-4 text-sm text-blue-800">
            When everyone has joined, generate the Common Ground plan.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={actionPending}
            className="inline-flex justify-center rounded-md bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
          >
            {actionPending ? 'Generating...' : 'Generate Common Ground Plan'}
          </button>
        </div>
      )}

      {/* LOBBY state — participant waiting */}
      {session.status === 'LOBBY' && !session.isLeader && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">
            Waiting for the leader to start the session...
          </p>
        </div>
      )}

      {/* ACTIVE state — exercise plan */}
      {session.status === 'ACTIVE' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h2 className="text-lg font-semibold text-green-900">
              Common Ground Plan
            </h2>
            <p className="mt-1 text-sm text-green-700">
              {session.exercises.length} exercise
              {session.exercises.length !== 1 && 's'} everyone needs today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {Object.entries(exercisesByCategory).map(([category, exercises]) => (
              <div key={category}>
                <h3 className="mb-4 text-xl font-semibold capitalize text-slate-800">
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex flex-col items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                    >
                      {exercise.imageUrl && (
                        <div className="relative h-40 w-full flex-shrink-0 sm:h-16 sm:w-16">
                          <Image
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-medium text-slate-900">
                          {exercise.name}
                        </h4>
                        {exercise.subCategory && (
                          <p className="text-sm text-slate-600">
                            {exercise.subCategory
                              .replace(/([A-Z])/g, ' $1')
                              .toLowerCase()
                              .trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {session.isLeader && (
            <div className="text-center">
              <button
                onClick={handleComplete}
                disabled={actionPending}
                className="inline-flex justify-center rounded-md bg-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-40"
              >
                {actionPending
                  ? 'Completing...'
                  : 'Mark Session Complete for Everyone'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* COMPLETED state */}
      {session.status === 'COMPLETED' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-green-900">
              All done! Exercises have been recorded for everyone.
            </h2>
            <p className="mt-2 text-sm text-green-700">
              {session.exercises.length} exercise
              {session.exercises.length !== 1 && 's'} completed by{' '}
              {session.participants.length} participant
              {session.participants.length !== 1 && 's'}.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex justify-center rounded-md bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
