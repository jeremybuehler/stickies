import { v4 as uuid } from 'uuid'
import type { Database } from './db'

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green'
export type NoteState = 'inbox' | 'active' | 'snoozed' | 'archived'

export interface Note {
  id: string
  content: string
  color: NoteColor
  source: 'text' | 'voice'
  rawTranscript?: string
  position: number
  createdAt: number
  updatedAt: number
  // Smart Inbox fields
  state: NoteState
  snoozedUntil?: number      // Timestamp when snoozed note returns to inbox
  lastSurfacedAt?: number    // Track when last shown for rediscovery
  linkedTo?: string          // ID of parent note (for linked notes)
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
  const state: NoteState = 'inbox'

  // Get max position for new note (insert at top)
  const posResult = db.exec(`SELECT COALESCE(MIN(position), 0) - 1 FROM notes`)
  const position = (posResult[0]?.values[0]?.[0] as number) ?? 0

  db.run(
    `INSERT INTO notes (id, content, color, source, raw_transcript, position, state, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, content, noteColor, source, rawTranscript ?? null, position, state, now, now]
  )

  return { id, content, color: noteColor, source, rawTranscript, position, state, createdAt: now, updatedAt: now }
}

export function getNote(db: Database, id: string): Note | null {
  const result = db.exec(
    `SELECT id, content, color, source, raw_transcript, position, state, snoozed_until, last_surfaced_at, linked_to, created_at, updated_at
     FROM notes WHERE id = ?`,
    [id]
  )

  if (!result[0]?.values[0]) return null

  const [noteId, content, color, source, rawTranscript, position, state, snoozedUntil, lastSurfacedAt, linkedTo, createdAt, updatedAt] =
    result[0].values[0] as [string, string, string, string, string | null, number, string | null, number | null, number | null, string | null, number, number]

  return {
    id: noteId,
    content,
    color: (color || 'yellow') as NoteColor,
    source: source as 'text' | 'voice',
    rawTranscript: rawTranscript ?? undefined,
    position: position ?? 0,
    state: (state || 'active') as NoteState,
    snoozedUntil: snoozedUntil ?? undefined,
    lastSurfacedAt: lastSurfacedAt ?? undefined,
    linkedTo: linkedTo ?? undefined,
    createdAt,
    updatedAt,
  }
}

export function getAllNotes(db: Database): Note[] {
  const result = db.exec(
    `SELECT id, content, color, source, raw_transcript, position, state, snoozed_until, last_surfaced_at, linked_to, created_at, updated_at
     FROM notes ORDER BY position ASC`
  )

  if (!result[0]) return []

  return result[0].values.map((row) => ({
    id: row[0] as string,
    content: row[1] as string,
    color: ((row[2] as string) || 'yellow') as NoteColor,
    source: row[3] as 'text' | 'voice',
    rawTranscript: (row[4] as string | null) ?? undefined,
    position: (row[5] as number) ?? 0,
    state: ((row[6] as string) || 'active') as NoteState,
    snoozedUntil: (row[7] as number | null) ?? undefined,
    lastSurfacedAt: (row[8] as number | null) ?? undefined,
    linkedTo: (row[9] as string | null) ?? undefined,
    createdAt: row[10] as number,
    updatedAt: row[11] as number,
  }))
}

export interface NoteUpdates {
  content?: string
  color?: NoteColor
  state?: NoteState
  snoozedUntil?: number | null
  lastSurfacedAt?: number | null
  linkedTo?: string | null
}

export function updateNote(
  db: Database,
  id: string,
  updates: NoteUpdates
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

  if (updates.state !== undefined) {
    db.run(`UPDATE notes SET state = ?, updated_at = ? WHERE id = ?`, [
      updates.state,
      now,
      id,
    ])
  }

  if (updates.snoozedUntil !== undefined) {
    db.run(`UPDATE notes SET snoozed_until = ?, updated_at = ? WHERE id = ?`, [
      updates.snoozedUntil,
      now,
      id,
    ])
  }

  if (updates.lastSurfacedAt !== undefined) {
    db.run(`UPDATE notes SET last_surfaced_at = ?, updated_at = ? WHERE id = ?`, [
      updates.lastSurfacedAt,
      now,
      id,
    ])
  }

  if (updates.linkedTo !== undefined) {
    db.run(`UPDATE notes SET linked_to = ?, updated_at = ? WHERE id = ?`, [
      updates.linkedTo,
      now,
      id,
    ])
  }
}

// State transition helpers
export function archiveNote(db: Database, id: string): void {
  updateNote(db, id, { state: 'archived', snoozedUntil: null })
}

export function snoozeNote(db: Database, id: string, until: number): void {
  updateNote(db, id, { state: 'snoozed', snoozedUntil: until })
}

export function activateNote(db: Database, id: string): void {
  updateNote(db, id, { state: 'active', snoozedUntil: null })
}

export function unsnoozeNote(db: Database, id: string): void {
  updateNote(db, id, { state: 'inbox', snoozedUntil: null })
}

export function processSnoozedNotes(db: Database): Note[] {
  const now = Date.now()
  const result = db.exec(
    `SELECT id FROM notes WHERE state = 'snoozed' AND snoozed_until IS NOT NULL AND snoozed_until <= ?`,
    [now]
  )

  if (!result[0]) return []

  const wokenNotes: Note[] = []
  for (const row of result[0].values) {
    const id = row[0] as string
    unsnoozeNote(db, id)
    const note = getNote(db, id)
    if (note) wokenNotes.push(note)
  }

  return wokenNotes
}

export function getRediscoveryCandidate(db: Database): Note | null {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000

  // Get archived notes not surfaced in 7+ days, archived more than 3 days ago
  const result = db.exec(
    `SELECT id, content, color, source, raw_transcript, position, state, snoozed_until, last_surfaced_at, linked_to, created_at, updated_at
     FROM notes
     WHERE state = 'archived'
       AND updated_at < ?
       AND (last_surfaced_at IS NULL OR last_surfaced_at < ?)
     ORDER BY RANDOM()
     LIMIT 1`,
    [threeDaysAgo, sevenDaysAgo]
  )

  if (!result[0]?.values[0]) return null

  const row = result[0].values[0]
  return {
    id: row[0] as string,
    content: row[1] as string,
    color: ((row[2] as string) || 'yellow') as NoteColor,
    source: row[3] as 'text' | 'voice',
    rawTranscript: (row[4] as string | null) ?? undefined,
    position: (row[5] as number) ?? 0,
    state: ((row[6] as string) || 'archived') as NoteState,
    snoozedUntil: (row[7] as number | null) ?? undefined,
    lastSurfacedAt: (row[8] as number | null) ?? undefined,
    linkedTo: (row[9] as string | null) ?? undefined,
    createdAt: row[10] as number,
    updatedAt: row[11] as number,
  }
}

export function markAsSurfaced(db: Database, id: string): void {
  updateNote(db, id, { lastSurfacedAt: Date.now() })
}

export function getNotesByState(db: Database, state: NoteState): Note[] {
  const result = db.exec(
    `SELECT id, content, color, source, raw_transcript, position, state, snoozed_until, last_surfaced_at, linked_to, created_at, updated_at
     FROM notes WHERE state = ? ORDER BY position ASC`,
    [state]
  )

  if (!result[0]) return []

  return result[0].values.map((row) => ({
    id: row[0] as string,
    content: row[1] as string,
    color: ((row[2] as string) || 'yellow') as NoteColor,
    source: row[3] as 'text' | 'voice',
    rawTranscript: (row[4] as string | null) ?? undefined,
    position: (row[5] as number) ?? 0,
    state: ((row[6] as string) || 'active') as NoteState,
    snoozedUntil: (row[7] as number | null) ?? undefined,
    lastSurfacedAt: (row[8] as number | null) ?? undefined,
    linkedTo: (row[9] as string | null) ?? undefined,
    createdAt: row[10] as number,
    updatedAt: row[11] as number,
  }))
}

export function getInboxCount(db: Database): number {
  const result = db.exec(`SELECT COUNT(*) FROM notes WHERE state = 'inbox'`)
  return (result[0]?.values[0]?.[0] as number) ?? 0
}

export function reorderNotes(db: Database, noteIds: string[]): void {
  const now = Date.now()
  noteIds.forEach((id, index) => {
    db.run(`UPDATE notes SET position = ?, updated_at = ? WHERE id = ?`, [index, now, id])
  })
}

export function deleteNote(db: Database, id: string): void {
  db.run(`DELETE FROM notes WHERE id = ?`, [id])
}
