import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'

export type Database = SqlJsDatabase

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

const DB_NAME = 'stickies-db'
const DB_STORE = 'database'
const DB_KEY = 'main'

// IndexedDB helpers for persistence
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE)
    }
  })
}

export async function saveDatabase(db: Database): Promise<void> {
  if (!isBrowser) return

  const data = db.export()
  const idb = await openIndexedDB()

  return new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE, 'readwrite')
    const store = tx.objectStore(DB_STORE)
    const request = store.put(data, DB_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
    tx.oncomplete = () => idb.close()
  })
}

async function loadDatabaseData(): Promise<Uint8Array | null> {
  if (!isBrowser) return null

  try {
    const idb = await openIndexedDB()

    return new Promise((resolve, reject) => {
      const tx = idb.transaction(DB_STORE, 'readonly')
      const store = tx.objectStore(DB_STORE)
      const request = store.get(DB_KEY)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
      tx.oncomplete = () => idb.close()
    })
  } catch {
    return null
  }
}

export async function createDatabase(): Promise<Database> {
  const SQL = await initSqlJs(
    isBrowser
      ? { locateFile: (file: string) => `https://sql.js.org/dist/${file}` }
      : undefined
  )

  // Try to load existing database from IndexedDB
  const existingData = await loadDatabaseData()
  const db = existingData ? new SQL.Database(existingData) : new SQL.Database()

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'yellow',
      source TEXT NOT NULL DEFAULT 'text',
      raw_transcript TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  // Migration: add color column if it doesn't exist (for existing databases)
  try {
    db.run(`ALTER TABLE notes ADD COLUMN color TEXT NOT NULL DEFAULT 'yellow'`)
  } catch {
    // Column already exists, ignore
  }

  // Migration: add position column if it doesn't exist
  try {
    db.run(`ALTER TABLE notes ADD COLUMN position INTEGER NOT NULL DEFAULT 0`)
    // Set initial positions based on created_at order
    db.run(`
      UPDATE notes SET position = (
        SELECT COUNT(*) FROM notes n2 WHERE n2.created_at > notes.created_at
      )
    `)
  } catch {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS embeddings (
      note_id TEXT PRIMARY KEY,
      vector BLOB NOT NULL,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS clusters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      note_ids TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  return db
}
