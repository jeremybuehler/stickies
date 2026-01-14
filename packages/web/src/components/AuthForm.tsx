import { useState } from 'react'

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  onOAuth?: (provider: 'google' | 'github') => Promise<void>
}

export function AuthForm({ onSignIn, onSignUp, onOAuth }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        await onSignUp(email, password)
      } else {
        await onSignIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
            required
            minLength={6}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-primary text-white font-semibold rounded-lg hover:bg-background0 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {onOAuth && (
        <div className="mt-4 space-y-2">
          <div className="text-center text-gray-500 text-sm">or continue with</div>
          <div className="flex gap-2">
            <button
              onClick={() => onOAuth('google')}
              className="flex-1 p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Google
            </button>
            <button
              onClick={() => onOAuth('github')}
              className="flex-1 p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              GitHub
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-muted-foreground hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
