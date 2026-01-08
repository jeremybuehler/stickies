import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Running in offline mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type DbNote = {
  id: string
  content: string
  color: 'yellow' | 'pink' | 'blue' | 'green'
  source: 'text' | 'voice'
  raw_transcript: string | null
  position: number
  // Smart Inbox fields
  state: 'inbox' | 'active' | 'snoozed' | 'archived'
  snoozed_until: string | null
  last_surfaced_at: string | null
  linked_to: string | null
  created_at: string
  updated_at: string
  user_id: string
}
