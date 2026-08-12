import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import { getStudentStaleness, listStudents } from '@/lib/admin/studentInsights'
import { StudentFilters } from './StudentFilters'
import { StudentTimeline } from './StudentTimeline'

/**
 * Single-owner admin gate. There's no roles/permissions system on User yet,
 * so this route is gated by comparing the signed-in session's email against
 * the instructor's own email. Override via OWNER_EMAIL if needed.
 */
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'charlievirgo666@gmail.com').toLowerCase()

type SearchParams = { studentId?: string }

export default async function StudentsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const session = await getServerSession(authConfig)

  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  if (session.user.email.toLowerCase() !== OWNER_EMAIL) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const studentId = resolvedSearchParams?.studentId || undefined

  const students = await listStudents()
  const selectedStudent = studentId ? students.find((s) => s.id === studentId) : undefined

  const staleness = selectedStudent ? await getStudentStaleness(selectedStudent.id) : null

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Student Insights</h1>
          <p className="mt-2 text-slate-600">
            Pick a student to see which exercises they&rsquo;re most overdue on, split by
            conditioning and restorative.
          </p>
        </div>

        <StudentFilters students={students} studentId={studentId} />

        {!selectedStudent && studentId && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Student not found.
          </div>
        )}

        {!studentId && (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Select a student above to see their staleness ranking.
          </div>
        )}

        {staleness && selectedStudent && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Staleness for {selectedStudent.name || selectedStudent.email}
            </h2>
            <StudentTimeline
              studentId={selectedStudent.id}
              conditioning={staleness.conditioning}
              restorative={staleness.restorative}
            />
          </section>
        )}
      </div>
    </div>
  )
}
