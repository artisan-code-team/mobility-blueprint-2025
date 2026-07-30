import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import {
  getCatchupGaps,
  getStudentStaleness,
  listStudents,
  type CatchupItem,
  type StalenessItem,
} from '@/lib/admin/studentInsights'
import { StudentFilters } from './StudentFilters'

/**
 * Single-owner admin gate. There's no roles/permissions system on User yet,
 * so this route is gated by comparing the signed-in session's email against
 * the instructor's own email. Override via OWNER_EMAIL if needed.
 */
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'charlievirgo666@gmail.com').toLowerCase()

type SearchParams = { studentId?: string; benchmarkId?: string }

function formatDaysSince(daysSince: number | null) {
  if (daysSince === null) return 'never'
  if (daysSince === 0) return 'today'
  return `${daysSince}d ago`
}

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
  const benchmarkId = resolvedSearchParams?.benchmarkId || undefined

  const students = await listStudents()
  const selectedStudent = studentId ? students.find((s) => s.id === studentId) : undefined
  const selectedBenchmark = benchmarkId ? students.find((s) => s.id === benchmarkId) : undefined

  const staleness = selectedStudent ? await getStudentStaleness(selectedStudent.id) : null
  const catchup =
    selectedStudent && selectedBenchmark && selectedStudent.id !== selectedBenchmark.id
      ? await getCatchupGaps(selectedStudent.id, selectedBenchmark.id)
      : null

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Student Insights</h1>
          <p className="mt-2 text-slate-600">
            Pick a student to see which exercises they&rsquo;re most overdue on, split by
            conditioning and restorative. Add a benchmark student to build a catch-up list.
          </p>
        </div>

        <StudentFilters students={students} studentId={studentId} benchmarkId={benchmarkId} />

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <StalenessColumn title="Conditioning" items={staleness.conditioning} />
              <StalenessColumn title="Restorative" items={staleness.restorative} />
            </div>
          </section>
        )}

        {selectedBenchmark && selectedStudent && selectedStudent.id === selectedBenchmark.id && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Pick a different benchmark student to compare against.
          </div>
        )}

        {catchup && selectedStudent && selectedBenchmark && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Catch-up list — what {selectedBenchmark.name || selectedBenchmark.email} has done
              that {selectedStudent.name || selectedStudent.email} hasn&rsquo;t
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CatchupColumn title="Conditioning" items={catchup.conditioning} />
              <CatchupColumn title="Restorative" items={catchup.restorative} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function StalenessColumn({ title, items }: { title: string; items: StalenessItem[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No exercises in this category.</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 text-sm last:border-0"
            >
              <span className="text-slate-700">
                <span className="mr-2 text-slate-400">{index + 1}.</span>
                {item.name}
              </span>
              <span
                className={
                  item.daysSince === null
                    ? 'shrink-0 font-medium text-red-600'
                    : 'shrink-0 font-medium text-slate-500'
                }
              >
                {formatDaysSince(item.daysSince)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function CatchupColumn({ title, items }: { title: string; items: CatchupItem[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No gaps — fully caught up.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-b border-slate-100 pb-2 text-sm text-slate-700 last:border-0"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
