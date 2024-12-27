'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/sign-in')
    },
  })

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-4 text-slate-600">
            Signed in as: <span className="font-medium text-slate-900">{session.user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
} 