import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

// Database connection (initialized lazily)
let db: DrizzleDb | null = null
let configuredUrl: string | null = null

export function initDb(databaseUrl: string): DrizzleDb {
  if (db && configuredUrl === databaseUrl) return db

  const sql = neon(databaseUrl)
  db = drizzle(sql, { schema })
  configuredUrl = databaseUrl
  return db
}

export function getDb(): DrizzleDb {
  if (!db) {
    throw new Error('Database not initialized. Call initDb(url) first.')
  }
  return db
}

export { schema }
export type { Note, NewNote, NoteColor, NoteSource, NoteState } from './schema'
