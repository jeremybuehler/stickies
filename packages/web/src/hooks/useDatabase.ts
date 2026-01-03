import { useState, useEffect } from 'react'
import { createDatabase, type Database } from '@stickies/core'

export function useDatabase() {
  const [db, setDb] = useState<Database | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    createDatabase()
      .then(setDb)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { db, loading, error }
}
