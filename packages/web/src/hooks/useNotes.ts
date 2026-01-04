import { useState, useCallback } from 'react'
import {
  createNote,
  getAllNotes,
  deleteNote,
  indexNote,
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
        const note = createNote(db, content)

        // Index in background - don't block UI
        indexNote(db, note).catch((err) => {
          console.error('Indexing failed:', err)
        })

        refresh()
      } finally {
        setLoading(false)
      }
    },
    [db, refresh]
  )

  const remove = useCallback(
    (id: string) => {
      if (!db) return
      deleteNote(db, id)
      refresh()
    },
    [db, refresh]
  )

  return { notes, loading, add, remove, refresh }
}
