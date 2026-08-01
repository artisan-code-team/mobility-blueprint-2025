import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Same single-owner admin gate as app/admin/students/page.tsx. Override via
 * OWNER_EMAIL if needed.
 */
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'charlievirgo666@gmail.com').toLowerCase()

/**
 * POST endpoint that lets the instructor mark an exercise complete on behalf
 * of an arbitrary student, from the /admin/students staleness list.
 *
 * Unlike /api/exercises/complete (which only completes exercises for the
 * signed-in user's own account and enforces a 30-day cooldown), this route:
 * 1. Gates on the owner email, not "is this the student's own session".
 * 2. Always refreshes the completion to now, no cooldown — this is a
 *    trusted manual instructor action, not something that needs rate
 *    limiting against the student themselves.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const session = await getServerSession(authConfig)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.email.toLowerCase() !== OWNER_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { studentId } = await params
    const { exerciseId } = await request.json()

    if (!exerciseId) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 })
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Delete any existing completion and create a fresh one, dated now.
    await prisma.exerciseCompletion.deleteMany({
      where: {
        userId: student.id,
        exerciseId,
      },
    })

    const completion = await prisma.exerciseCompletion.create({
      data: {
        userId: student.id,
        exerciseId,
        createdAt: new Date(),
      },
    })

    return NextResponse.json(completion)
  } catch (error) {
    console.error('Error marking exercise complete for student:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
