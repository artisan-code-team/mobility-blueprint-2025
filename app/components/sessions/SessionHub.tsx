'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SessionHub() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions/create', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create session')
      }
      const session = await res.json()
      router.push(`/sessions/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setCreating(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setJoining(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join session')
      }
      const session = await res.json()
      router.push(`/sessions/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setJoining(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Start a Session</h2>
        <p className="mt-1 text-sm text-slate-600">
          Generate a session code and invite others to join your practice.
        </p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="mt-4 inline-flex justify-center rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 disabled:opacity-40"
        >
          {creating ? 'Creating...' : 'Create Session'}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Join a Session</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter the 4-character code shared by your session leader.
        </p>
        <form onSubmit={handleJoin} className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            maxLength={4}
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-center font-mono text-lg uppercase tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={joining || code.length < 4}
            className="inline-flex justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 disabled:opacity-40"
          >
            {joining ? 'Joining...' : 'Join'}
          </button>
        </form>
      </div>
    </div>
  )
}
