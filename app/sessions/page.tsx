import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionHub } from '@/app/components/sessions/SessionHub'

export default async function SessionsPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      subscriptionStatus: true,
      subscriptionEnd: true,
    },
  })

  if (!user) {
    redirect('/sign-in')
  }

  const hasActiveSubscription =
    user.subscriptionStatus === 'ACTIVE' ||
    (user.subscriptionStatus === 'CANCELED' &&
      user.subscriptionEnd &&
      user.subscriptionEnd > new Date())

  if (!hasActiveSubscription) {
    redirect('/subscribe')
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Group Sessions</h1>
          <p className="mt-2 text-slate-600">
            Practice together with a shared &ldquo;Common Ground&rdquo; exercise plan.
          </p>
        </div>
        <SessionHub />
      </div>
    </div>
  )
}
