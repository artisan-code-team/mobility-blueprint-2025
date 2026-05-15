import { isGoogleAuthConfigured } from '@/lib/auth/config'
import { SignInClient } from './SignInClient'

export default function SignInPage() {
  return <SignInClient showGoogleSignIn={isGoogleAuthConfigured()} />
}
