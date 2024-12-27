import NextAuth from 'next-auth'
import { authConfig } from './config'

export const { auth, signIn, signOut } = NextAuth(authConfig)

// Use this to protect server components
export const isAuthenticated = async () => {
  const session = await auth()
  return session?.user != null
} 