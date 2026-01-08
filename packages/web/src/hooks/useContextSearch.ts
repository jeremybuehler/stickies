import { useState, useEffect, useCallback, useRef } from 'react'
import { searchNotes, type Database, type SearchResult } from '@stickies/core'

interface UseContextSearchOptions {
  debounceMs?: number
  maxResults?: number
  minQueryLength?: number
}

export function useContextSearch(
  db: Database | null,
  options: UseContextSearchOptions = {}
) {
  const { debounceMs = 300, maxResults = 3, minQueryLength = 3 } = options
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const search = useCallback(
    async (text: string) => {
      if (!db || text.length < minQueryLength) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const searchResults = await searchNotes(db, text)
        // Filter out archived notes unless highly relevant (score > 0.8)
        const filtered = searchResults
          .filter((r) => r.note.state !== 'archived' || r.score > 0.8)
          .slice(0, maxResults)
        setResults(filtered)
      } catch (error) {
        console.error('Context search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [db, maxResults, minQueryLength]
  )

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    if (!query || query.length < minQueryLength) {
      setResults([])
      return
    }

    // Debounce the search
    timeoutRef.current = window.setTimeout(() => {
      search(query)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [query, search, debounceMs, minQueryLength])

  const updateQuery = useCallback((text: string) => {
    setQuery(text)
  }, [])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    results,
    loading,
    updateQuery,
    clear,
  }
}
