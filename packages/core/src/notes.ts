import { v4 as uuid } from 'uuid'
import type { Database } from './db'

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green'

export interface Note {
  id: string
  content: string
  color: NoteColor
  source: 'text' | 'voice'
  rawTranscript?: string
  createdAt: number
  updatedAt: number
}

const defaultColors: NoteColor[] = ['yellow', 'pink', 'blue', 'green']

export function createNote(
  db: Database,
  content: string,
  source: 'text' | 'voice' = 'text',
  rawTranscript?: string,
  color?: NoteColor
): Note {
  const id = uuid()
  const now = Date.now()
  const noteColor = color ?? defaultColors[Math.floor(Math.random() * defaultColors.length)]

  db.run(
    `INSERT INTO notes (id, content, color, source, raw_transcript, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, content, noteColor, source, rawTranscript ?? null, now, now]
  )

  return { id, content, color: noteColor, source, rawTranscript, createdAt: now, updatedAt: now }
}

export function getNote(db: Database, id: string): Note | null {
  const result = db.exec(
    `SELECT id, content, color, source, raw_transcript, created_at, updated_at
     FROM notes WHERE id = ?`,
    [id]
  )

  if (!result[0]?.values[0]) return null

  const [noteId, content, color, source, rawTranscript, createdAt, updatedAt] =
    result[0].values[0] as [string, string, string, string, string | null, number, number]

  return {
    id: noteId,
    content,
    color: (color || 'yellow') as NoteColor,
    source: source as 'text' | 'voice',
    rawTranscript: rawTranscript ?? undefined,
    createdAt,
    updatedAt,
  }
}

export function getAllNotes(db: Database): Note[] {
  const result = db.exec(
    `SELECT id, content, color, source, raw_transcript, created_at, updated_at
     FROM notes ORDER BY created_at DESC`
  )

  if (!result[0]) return []

  return result[0].values.map((row) => ({
    id: row[0] as string,
    content: row[1] as string,
    color: ((row[2] as string) || 'yellow') as NoteColor,
    source: row[3] as 'text' | 'voice',
    rawTranscript: (row[4] as string | null) ?? undefined,
    createdAt: row[5] as number,
    updatedAt: row[6] as number,
  }))
}

export function updateNote(
  db: Database,
  id: string,
  updates: { content?: string; color?: NoteColor }
): void {
  const now = Date.now()

  if (updates.content !== undefined) {
    db.run(`UPDATE notes SET content = ?, updated_at = ? WHERE id = ?`, [
      updates.content,
      now,
      id,
    ])
  }

  if (updates.color !== undefined) {
    db.run(`UPDATE notes SET color = ?, updated_at = ? WHERE id = ?`, [
      updates.color,
      now,
      id,
    ])
  }
}

export function deleteNote(db: Database, id: string): void {
  db.run(`DELETE FROM notes WHERE id = ?`, [id])
}
