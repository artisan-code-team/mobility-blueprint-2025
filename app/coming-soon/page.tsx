"use client";

import { Button } from '../components/Button'
import { useRouter } from 'next/navigation'

export default function ComingSoon() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-6xl font-extrabold text-slate-800 mb-8">
          Coming Soon
        </h1>
        <Button color="blue" onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  )
} 