import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import { getStudentStaleness, listStudents, type StalenessItem } from '@/lib/admin/studentInsights'
import { StudentFilters } from './StudentFilters'
import { MarkCompleteButton } from './MarkCompleteButton'

/**
 * Single-owner admin gate. There's no roles/permissions system on User yet,
 * so this route is gated by comparing the signed-in session's email against
 * the instructor's own email. Override via OWNER_EMAIL if needed.
 */
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'charlievirgo666@gmail.com').toLowerCase()

type SearchParams = { studentId?: string }

function formatDaysSince(daysSince: number | null) {
  if (daysSince === null) return 'never'
  if (daysSince === 0) return 'today'
  return `${daysSince}d ago`
}

/**
 * Color-codes recency at a glance for in-class use, matching the 30-day
 * "this month" window used elsewhere (dashboard progress ring, completion
 * cooldown): green if done within the last month, red if never done, slate
 * for anything older. Meant to be scannable without reading numbers while
 * teaching.
 */
function daysSinceClassName(daysSince: number | null) {
  if (daysSince === null) return 'shrink-0 text-sm font-medium text-red-600'
  if (daysSince <= 30) return 'shrink-0 text-sm font-medium text-green-600'
  return 'shrink-0 text-sm font-medium text-slate-500'
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <StalenessColumn
                title="Conditioning"
                items={staleness.conditioning}
                studentId={selectedStudent.id}
              />
              <StalenessColumn
                title="Restorative"
                items={staleness.restorative}
                studentId={selectedStudent.id}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function StalenessColumn({
  title,
  items,
  studentId,
}: {
  title: string
  items: StalenessItem[]
  studentId: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No exercises in this category.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 border-b border-slate-100 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {item.imageUrl && (
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 text-sm">
                  <span className="mr-2 text-slate-400">{index + 1}.</span>
                  <span className="text-slate-700">{item.name}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <span className={daysSinceClassName(item.daysSince)}>
                  {formatDaysSince(item.daysSince)}
                </span>
                <MarkCompleteButton studentId={studentId} exerciseId={item.id} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
