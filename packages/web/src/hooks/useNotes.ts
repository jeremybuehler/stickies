import { useState, useCallback } from 'react'
import {
  createNote,
  getAllNotes,
  updateNote,
  deleteNote,
  reorderNotes,
  saveDatabase,
  type Database,
  type Note,
  type NoteColor,
} from '@stickies/core'

export function useNotes(db: Database | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!db) return
    setNotes(getAllNotes(db))
  }, [db])

  const add = useCallback(
    async (content: string, source: 'text' | 'voice' = 'text') => {
      if (!db) return
      setLoading(true)
      try {
        createNote(db, content, source)

        // Save to IndexedDB for persistence
        await saveDatabase(db)

        refresh()
      } finally {
        setLoading(false)
      }
    },
    [db, refresh]
  )

  const update = useCallback(
    async (id: string, updates: { content?: string; color?: NoteColor }) => {
      if (!db) return
      updateNote(db, id, updates)
      await saveDatabase(db)
      refresh()
    },
    [db, refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      if (!db) return
      deleteNote(db, id)
      await saveDatabase(db)
      refresh()
    },
    [db, refresh]
  )

  const reorder = useCallback(
    async (noteIds: string[]) => {
      if (!db) return
      reorderNotes(db, noteIds)
      await saveDatabase(db)
      refresh()
    },
    [db, refresh]
  )

  return { notes, loading, add, update, remove, reorder, refresh }
}
