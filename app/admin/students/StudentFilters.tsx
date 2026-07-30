'use client'

import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string | null
  email: string | null
}

function label(student: Student) {
  return student.name || student.email || student.id
}

export function StudentFilters({
  students,
  studentId,
  benchmarkId,
}: {
  students: Student[]
  studentId?: string
  benchmarkId?: string
}) {
  const router = useRouter()

  const navigate = (next: { studentId?: string; benchmarkId?: string }) => {
    const params = new URLSearchParams()
    if (next.studentId) params.set('studentId', next.studentId)
    if (next.benchmarkId) params.set('benchmarkId', next.benchmarkId)
    const query = params.toString()
    router.push(`/admin/students${query ? `?${query}` : ''}`)
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end">
      <label className="flex-1 text-sm font-medium text-slate-700">
        Student
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={studentId ?? ''}
          onChange={(e) => navigate({ studentId: e.target.value || undefined, benchmarkId })}
        >
          <option value="">Select a student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex-1 text-sm font-medium text-slate-700">
        Benchmark student (optional)
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={benchmarkId ?? ''}
          onChange={(e) => navigate({ studentId, benchmarkId: e.target.value || undefined })}
        >
          <option value="">None</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
