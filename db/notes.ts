import { eq, and, lte, isNull, or, desc, asc, sql } from 'drizzle-orm'
import { getDb, schema } from './index'
import type { Note, NewNote, NoteColor, NoteState } from './schema'

const { notes } = schema

// Generate a UUID
function generateId(): string {
  return crypto.randomUUID()
}

// Create a new note
export async function createNote(
  userId: string,
  content: string,
  source: 'text' | 'voice' = 'text',
  rawTranscript?: string,
  color?: NoteColor
): Promise<Note> {
  const db = getDb()
  const id = generateId()
  const noteColor = color ?? (['yellow', 'pink', 'blue', 'green'] as const)[Math.floor(Math.random() * 4)]

  // Get min position for new note (insert at top)
  const posResult = await db
    .select({ minPos: sql<number>`COALESCE(MIN(${notes.position}), 0) - 1` })
    .from(notes)
    .where(eq(notes.userId, userId))

  const position = posResult[0]?.minPos ?? 0

  const [note] = await db
    .insert(notes)
    .values({
      id,
      userId,
      content,
      color: noteColor,
      source,
      rawTranscript,
      position,
      state: 'inbox',
    })
    .returning()

  return note
}

// Get a single note by ID
export async function getNote(userId: string, id: string): Promise<Note | null> {
  const db = getDb()
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))

  return note ?? null
}

// Get all notes for a user
export async function getAllNotes(userId: string): Promise<Note[]> {
  const db = getDb()
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(asc(notes.position))
}

// Get notes by state
export async function getNotesByState(userId: string, state: NoteState): Promise<Note[]> {
  const db = getDb()
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.state, state)))
    .orderBy(asc(notes.position))
}

// Get inbox count
export async function getInboxCount(userId: string): Promise<number> {
  const db = getDb()
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.state, 'inbox')))

  return result[0]?.count ?? 0
}

// Update note fields
export interface NoteUpdates {
  content?: string
  color?: NoteColor
  state?: NoteState
  snoozedUntil?: Date | null
  lastSurfacedAt?: Date | null
  linkedTo?: string | null
}

export async function updateNote(userId: string, id: string, updates: NoteUpdates): Promise<void> {
  const db = getDb()

  await db
    .update(notes)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
}

// State transition helpers
export async function archiveNote(userId: string, id: string): Promise<void> {
  await updateNote(userId, id, { state: 'archived', snoozedUntil: null })
}

export async function snoozeNote(userId: string, id: string, until: Date): Promise<void> {
  await updateNote(userId, id, { state: 'snoozed', snoozedUntil: until })
}

export async function activateNote(userId: string, id: string): Promise<void> {
  await updateNote(userId, id, { state: 'active', snoozedUntil: null })
}

export async function unsnoozeNote(userId: string, id: string): Promise<void> {
  await updateNote(userId, id, { state: 'inbox', snoozedUntil: null })
}

// Process snoozed notes that are due
export async function processSnoozedNotes(userId: string): Promise<Note[]> {
  const db = getDb()
  const now = new Date()

  // Find snoozed notes that are due
  const dueNotes = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        eq(notes.state, 'snoozed'),
        lte(notes.snoozedUntil, now)
      )
    )

  // Unsnooze each one
  for (const note of dueNotes) {
    await unsnoozeNote(userId, note.id)
  }

  // Return updated notes
  return Promise.all(dueNotes.map((n) => getNote(userId, n.id).then((note) => note!)))
}

// Get a random rediscovery candidate
export async function getRediscoveryCandidate(userId: string): Promise<Note | null> {
  const db = getDb()
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const [note] = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        eq(notes.state, 'archived'),
        lte(notes.updatedAt, threeDaysAgo),
        or(isNull(notes.lastSurfacedAt), lte(notes.lastSurfacedAt, sevenDaysAgo))
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(1)

  return note ?? null
}

// Mark note as surfaced
export async function markAsSurfaced(userId: string, id: string): Promise<void> {
  await updateNote(userId, id, { lastSurfacedAt: new Date() })
}

// Reorder notes
export async function reorderNotes(userId: string, noteIds: string[]): Promise<void> {
  const db = getDb()

  for (let i = 0; i < noteIds.length; i++) {
    await db
      .update(notes)
      .set({ position: i, updatedAt: new Date() })
      .where(and(eq(notes.id, noteIds[i]), eq(notes.userId, userId)))
  }
}

// Delete a note
export async function deleteNote(userId: string, id: string): Promise<void> {
  const db = getDb()
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
}

// Search notes (basic text search)
export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  const db = getDb()
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        sql`${notes.content} ILIKE ${'%' + query + '%'}`
      )
    )
    .orderBy(desc(notes.updatedAt))
    .limit(10)
}
