import { v4 as uuid } from 'uuid'
import type { Database } from './db'

export interface Note {
  id: string
  content: string
  source: 'text' | 'voice'
  rawTranscript?: string
  createdAt: number
  updatedAt: number
}

export function createNote(
  db: Database,
  content: string,
  source: 'text' | 'voice' = 'text',
  rawTranscript?: string
): Note {
  const id = uuid()
  const now = Date.now()

  db.run(
    `INSERT INTO notes (id, content, source, raw_transcript, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, content, source, rawTranscript ?? null, now, now]
  )

  return { id, content, source, rawTranscript, createdAt: now, updatedAt: now }
}

export function getNote(db: Database, id: string): Note | null {
  const result = db.exec(
    `SELECT id, content, source, raw_transcript, created_at, updated_at
     FROM notes WHERE id = ?`,
    [id]
  )

  if (!result[0]?.values[0]) return null

  const [noteId, content, source, rawTranscript, createdAt, updatedAt] =
    result[0].values[0] as [string, string, string, string | null, number, number]

  return {
    id: noteId,
    content,
    source: source as 'text' | 'voice',
    rawTranscript: rawTranscript ?? undefined,
    createdAt,
    updatedAt,
  }
}

export function getAllNotes(db: Database): Note[] {
  const result = db.exec(
    `SELECT id, content, source, raw_transcript, created_at, updated_at
     FROM notes ORDER BY created_at DESC`
  )

  if (!result[0]) return []

  return result[0].values.map((row) => ({
    id: row[0] as string,
    content: row[1] as string,
    source: row[2] as 'text' | 'voice',
    rawTranscript: (row[3] as string | null) ?? undefined,
    createdAt: row[4] as number,
    updatedAt: row[5] as number,
  }))
}

export function deleteNote(db: Database, id: string): void {
  db.run(`DELETE FROM notes WHERE id = ?`, [id])
}
