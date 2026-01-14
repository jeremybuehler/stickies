import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { initDb } from '../../../../db'
import * as notesApi from '../../../../db/notes'
import type { Note, NoteColor, NoteState } from '../../../../db/schema'

// Initialize database on module load
const databaseUrl = import.meta.env.VITE_DATABASE_URL
if (databaseUrl) {
  initDb(databaseUrl)
}

const DEV_USER_ID = 'dev-user-local'

export function useNeonNotes(devBypass = false) {
  const { user, isLoaded } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use dev user ID if bypass is enabled, otherwise use Clerk user ID
  const userId = devBypass ? DEV_USER_ID : user?.id

  // Fetch all notes
  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await notesApi.getAllNotes(userId)
      setNotes(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    if (devBypass && userId) {
      // Dev bypass mode - fetch immediately
      refresh()
    } else if (isLoaded && userId) {
      refresh()
    } else if (isLoaded && !userId && !devBypass) {
      setNotes([])
      setLoading(false)
    }
  }, [isLoaded, userId, refresh, devBypass])

  // Add a new note
  const add = useCallback(
    async (content: string, source: 'text' | 'voice' = 'text', color?: NoteColor) => {
      if (!userId) return
      try {
        const note = await notesApi.createNote(userId, content, source, undefined, color)
        setNotes((prev) => [note, ...prev])
        return note
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Update a note
  const update = useCallback(
    async (id: string, updates: { content?: string; color?: NoteColor }) => {
      if (!userId) return
      try {
        await notesApi.updateNote(userId, id, updates)
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n))
        )
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Delete a note
  const remove = useCallback(
    async (id: string) => {
      if (!userId) return
      try {
        await notesApi.deleteNote(userId, id)
        setNotes((prev) => prev.filter((n) => n.id !== id))
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Reorder notes
  const reorder = useCallback(
    async (noteIds: string[]) => {
      if (!userId) return
      try {
        await notesApi.reorderNotes(userId, noteIds)
        setNotes((prev) => {
          const noteMap = new Map(prev.map((n) => [n.id, n]))
          return noteIds.map((id, i) => ({ ...noteMap.get(id)!, position: i }))
        })
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Archive a note
  const archive = useCallback(
    async (id: string) => {
      if (!userId) return
      try {
        await notesApi.archiveNote(userId, id)
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, state: 'archived' as NoteState, snoozedUntil: null } : n
          )
        )
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Snooze a note
  const snooze = useCallback(
    async (id: string, until: Date) => {
      if (!userId) return
      try {
        await notesApi.snoozeNote(userId, id, until)
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, state: 'snoozed' as NoteState, snoozedUntil: until } : n
          )
        )
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Activate a note
  const activate = useCallback(
    async (id: string) => {
      if (!userId) return
      try {
        await notesApi.activateNote(userId, id)
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, state: 'active' as NoteState, snoozedUntil: null } : n
          )
        )
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Unarchive a note (move to inbox)
  const unarchive = useCallback(
    async (id: string) => {
      if (!userId) return
      try {
        await notesApi.unsnoozeNote(userId, id)
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, state: 'inbox' as NoteState, snoozedUntil: null } : n
          )
        )
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Process snoozed notes that are due
  const processSnoozed = useCallback(async () => {
    if (!userId) return []
    try {
      const woken = await notesApi.processSnoozedNotes(userId)
      if (woken.length > 0) {
        await refresh()
      }
      return woken.map((n) => n.id)
    } catch (err) {
      setError(err as Error)
      return []
    }
  }, [userId, refresh])

  // Get inbox count
  const getInboxCount = useCallback(() => {
    return notes.filter((n) => n.state === 'inbox').length
  }, [notes])

  // Get rediscovery candidate
  const getRediscoveryCandidate = useCallback(async () => {
    if (!userId) return null
    try {
      return await notesApi.getRediscoveryCandidate(userId)
    } catch (err) {
      setError(err as Error)
      return null
    }
  }, [userId])

  // Mark as surfaced
  const markAsSurfaced = useCallback(
    async (id: string) => {
      if (!userId) return
      try {
        await notesApi.markAsSurfaced(userId, id)
      } catch (err) {
        setError(err as Error)
      }
    },
    [userId]
  )

  // Search notes
  const searchNotes = useCallback(
    async (query: string) => {
      if (!userId || !query.trim()) return []
      try {
        return await notesApi.searchNotes(userId, query)
      } catch (err) {
        setError(err as Error)
        return []
      }
    },
    [userId]
  )

  return {
    notes,
    loading,
    error,
    add,
    update,
    remove,
    reorder,
    refresh,
    archive,
    snooze,
    activate,
    unarchive,
    processSnoozed,
    getInboxCount,
    getRediscoveryCandidate,
    markAsSurfaced,
    searchNotes,
  }
}
