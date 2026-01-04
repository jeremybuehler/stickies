import { useState, useCallback } from 'react'
import {
  createNote,
  getAllNotes,
  deleteNote,
  saveDatabase,
  type Database,
  type Note,
} from '@stickies/core'

export function useNotes(db: Database | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!db) return
    setNotes(getAllNotes(db))
  }, [db])

  const add = useCallback(
    async (content: string) => {
      if (!db) return
      setLoading(true)
      try {
        createNote(db, content)

        // Save to IndexedDB for persistence
        await saveDatabase(db)

        // Note: Embedding indexing disabled until Vite + transformers.js compatibility is resolved
        // TODO: Re-enable with web worker solution

        refresh()
      } finally {
        setLoading(false)
      }
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

  return { notes, loading, add, remove, refresh }
}
