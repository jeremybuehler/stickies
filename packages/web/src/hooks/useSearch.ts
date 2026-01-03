import { useState, useCallback } from 'react'
import { searchNotes, type Database, type SearchResult } from '@stickies/core'

export function useSearch(db: Database | null) {
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(
    async (query: string) => {
      if (!db) return
      setLoading(true)
      try {
        const res = await searchNotes(db, query)
        setResults(res)
      } finally {
        setLoading(false)
      }
    },
    [db]
  )

  const clear = useCallback(() => {
    setResults(null)
  }, [])

  return { results, loading, search, clear }
}
