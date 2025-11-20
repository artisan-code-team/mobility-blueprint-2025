'use client'

import { signIn } from "next-auth/react"
import { Button } from "../components/Button"
import { useState } from "react"

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [linkSent, setLinkSent] = useState(false)

  /**
   * Handles the email sign in form submission.
   * 
   * This function:
   * 1. Prevents default form submission
   * 2. Shows loading state while request is in progress
   * 3. Attempts to sign in using the provided email address
   * 4. Displays success/error message based on the result
   * 5. Redirects to dashboard on successful authentication
   * 
   * @param e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if link has already been sent
    if (linkSent) {
      return
    }
    
    setIsLoading(true)
    setMessage(null)
    setLinkSent(false)

    try {
      const result = await signIn('email', {
        email,
        callbackUrl: '/dashboard',
        redirect: false,
      })

      if (result?.error) {
        setMessage('Something went wrong. Please try again.')
      } else {
        setMessage('Your access link is flowing to your inbox!')
        setLinkSent(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-800">
            Unlock Your Practice
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email to receive your secure link.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || linkSent}
              aria-disabled={linkSent}
            />
          </div>

          {message && (
            <p 
              className="mt-2 text-sm text-slate-600 text-center"
              role={linkSent ? "status" : "alert"}
              aria-live={linkSent ? "polite" : "assertive"}
              aria-atomic="true"
            >
              {message}
            </p>
          )}

          {!linkSent && (
            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending secure link...' : 'Get My Access Link'}
            </Button>
          )}
        </form>
      </div>
    </div>
  )
} 