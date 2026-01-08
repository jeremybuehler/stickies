import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

interface Props {
  children: React.ReactNode
}

export function ClerkProvider({ children }: Props) {
  if (!clerkPubKey) {
    console.warn('Clerk not configured. Set VITE_CLERK_PUBLISHABLE_KEY.')
    return <>{children}</>
  }

  return (
    <BaseClerkProvider publishableKey={clerkPubKey}>
      {children}
    </BaseClerkProvider>
  )
}

export { useUser, useAuth, SignIn, SignUp, UserButton } from '@clerk/clerk-react'
