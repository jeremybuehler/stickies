import { useState, useCallback, useEffect } from 'react'
import { supabase, type DbNote } from '../lib/supabase'
import type { Note, NoteColor, NoteState } from '@stickies/core'

function dbNoteToNote(dbNote: DbNote): Note {
  return {
    id: dbNote.id,
    content: dbNote.content,
    color: dbNote.color,
    source: dbNote.source,
    rawTranscript: dbNote.raw_transcript ?? undefined,
    position: dbNote.position,
    state: dbNote.state ?? 'active',
    snoozedUntil: dbNote.snoozed_until ? new Date(dbNote.snoozed_until).getTime() : undefined,
    lastSurfacedAt: dbNote.last_surfaced_at ? new Date(dbNote.last_surfaced_at).getTime() : undefined,
    linkedTo: dbNote.linked_to ?? undefined,
    createdAt: new Date(dbNote.created_at).getTime(),
    updatedAt: new Date(dbNote.updated_at).getTime(),
  }
}

export function useSupabaseNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('position', { ascending: true })

      if (fetchError) throw fetchError

      setNotes((data || []).map(dbNoteToNote))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notes'))
    } finally {
      setLoading(false)
    }
  }, [])

  const add = useCallback(
    async (content: string, source: 'text' | 'voice' = 'text', rawTranscript?: string) => {
      if (!supabase) return

      setLoading(true)
      setError(null)

      try {
        // Get min position to insert at top
        const { data: posData } = await supabase
          .from('notes')
          .select('position')
          .order('position', { ascending: true })
          .limit(1)

        const position = posData?.[0]?.position ?? 0
        const newPosition = position - 1

        const colors: NoteColor[] = ['yellow', 'pink', 'blue', 'green']
        const color = colors[Math.floor(Math.random() * colors.length)]

        const { data: user } = await supabase.auth.getUser()

        const { error: insertError } = await supabase.from('notes').insert({
          content,
          color,
          source,
          raw_transcript: rawTranscript ?? null,
          position: newPosition,
          state: 'inbox',
          user_id: user.user?.id,
        })

        if (insertError) throw insertError

        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to add note'))
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  const update = useCallback(
    async (id: string, updates: { content?: string; color?: NoteColor }) => {
      if (!supabase) return

      setLoading(true)
      setError(null)

      try {
        const { error: updateError } = await supabase
          .from('notes')
          .update(updates)
          .eq('id', id)

        if (updateError) throw updateError

        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update note'))
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      if (!supabase) return

      setLoading(true)
      setError(null)

      try {
        const { error: deleteError } = await supabase.from('notes').delete().eq('id', id)

        if (deleteError) throw deleteError

        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete note'))
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  const reorder = useCallback(
    async (noteIds: string[]) => {
      if (!supabase) return

      setLoading(true)
      setError(null)

      try {
        const updates = noteIds.map((id, index) =>
          supabase!.from('notes').update({ position: index }).eq('id', id)
        )

        await Promise.all(updates)
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to reorder notes'))
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  // State transition functions
  const archive = useCallback(
    async (id: string) => {
      if (!supabase) return

      try {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ state: 'archived', snoozed_until: null })
          .eq('id', id)

        if (updateError) throw updateError
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to archive note'))
      }
    },
    [refresh]
  )

  const snooze = useCallback(
    async (id: string, until: Date) => {
      if (!supabase) return

      try {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ state: 'snoozed', snoozed_until: until.toISOString() })
          .eq('id', id)

        if (updateError) throw updateError
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to snooze note'))
      }
    },
    [refresh]
  )

  const activate = useCallback(
    async (id: string) => {
      if (!supabase) return

      try {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ state: 'active', snoozed_until: null })
          .eq('id', id)

        if (updateError) throw updateError
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to activate note'))
      }
    },
    [refresh]
  )

  const unarchive = useCallback(
    async (id: string) => {
      if (!supabase) return

      try {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ state: 'inbox' })
          .eq('id', id)

        if (updateError) throw updateError
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to unarchive note'))
      }
    },
    [refresh]
  )

  const processSnoozed = useCallback(async () => {
    if (!supabase) return []

    const now = new Date().toISOString()

    try {
      // Find snoozed notes that are due
      const { data: dueNotes, error: fetchError } = await supabase
        .from('notes')
        .select('id')
        .eq('state', 'snoozed')
        .lte('snoozed_until', now)

      if (fetchError) throw fetchError
      if (!dueNotes?.length) return []

      // Move them back to inbox
      const { error: updateError } = await supabase
        .from('notes')
        .update({ state: 'inbox', snoozed_until: null })
        .in('id', dueNotes.map((n) => n.id))

      if (updateError) throw updateError
      await refresh()

      return dueNotes.map((n) => n.id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to process snoozed notes'))
      return []
    }
  }, [refresh])

  const getInboxCount = useCallback(() => {
    return notes.filter((n) => n.state === 'inbox').length
  }, [notes])

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [refresh])

  // Real-time subscription
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [refresh])

  return {
    notes,
    loading,
    error,
    add,
    update,
    remove,
    reorder,
    refresh,
    // Smart Inbox functions
    archive,
    snooze,
    activate,
    unarchive,
    processSnoozed,
    getInboxCount,
    isConnected: !!supabase,
  }
}
