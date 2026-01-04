import { useState, useEffect, useRef } from 'react'
import { createDatabase, type Database } from '@stickies/core'

// Singleton database instance to survive React StrictMode double-mount
let dbInstance: Database | null = null
let dbPromise: Promise<Database> | null = null

async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance
  if (dbPromise) return dbPromise

  dbPromise = createDatabase().then((db) => {
    dbInstance = db
    return db
  })

  return dbPromise
}

export function useDatabase() {
  const [db, setDb] = useState<Database | null>(dbInstance)
  const [loading, setLoading] = useState(!dbInstance)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (dbInstance) {
      setDb(dbInstance)
      setLoading(false)
      return
    }

    getDatabase()
      .then(setDb)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { db, loading, error }
}
