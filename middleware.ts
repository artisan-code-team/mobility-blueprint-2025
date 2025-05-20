import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
// import { prisma } from '@/lib/prisma'

function isPublicPath(pathname: string) {
  return (
    pathname === '/sign-in' ||
    /^\/api\/auth(\/.*)?$/.test(pathname) ||
    /^\/api\/webhooks(\/.*)?$/.test(pathname)
  );
}

function isNonSubscriptionPath(pathname: string) {
  return (
    pathname === '/sign-in' ||
    /^\/api\/auth(\/.*)?$/.test(pathname) ||
    /^\/api\/webhooks(\/.*)?$/.test(pathname) ||
    /^\/api\/subscription(\/.*)?$/.test(pathname) ||
    pathname === '/subscription'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Add debug log
  const token = await getToken({ req: request })
  console.log('MIDDLEWARE TOKEN:', token)

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // --- TEMPORARILY DISABLED AUTH/SUBSCRIPTION CHECKS ---
  // // Check authentication
  // const token = await getToken({ req: request })
  // if (!token) {
  //   return NextResponse.redirect(new URL('/sign-in', request.url))
  // }

  // // Allow non-subscription paths
  // if (isNonSubscriptionPath(pathname)) {
  //   return NextResponse.next()
  // }

  // // Check subscription status
  // const user = await prisma.user.findUnique({
  //   where: { email: token.email as string },
  //   include: { subscription: true },
  // })

  // if (!user?.subscription || user.subscription.status !== 'active') {
  //   return NextResponse.redirect(new URL('/sign-in', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 