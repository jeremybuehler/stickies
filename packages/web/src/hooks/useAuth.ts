import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    isConfigured: !!supabase,
  }
}
