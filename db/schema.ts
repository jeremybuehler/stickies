import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const noteColorEnum = pgEnum('note_color', ['yellow', 'pink', 'blue', 'green'])
export const noteSourceEnum = pgEnum('note_source', ['text', 'voice'])
export const noteStateEnum = pgEnum('note_state', ['inbox', 'active', 'snoozed', 'archived'])

// Notes table
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  color: noteColorEnum('color').notNull().default('yellow'),
  source: noteSourceEnum('source').notNull().default('text'),
  rawTranscript: text('raw_transcript'),
  position: integer('position').notNull().default(0),
  state: noteStateEnum('state').notNull().default('inbox'),
  snoozedUntil: timestamp('snoozed_until', { mode: 'date' }),
  lastSurfacedAt: timestamp('last_surfaced_at', { mode: 'date' }),
  linkedTo: text('linked_to'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

// Embeddings table for semantic search
export const embeddings = pgTable('embeddings', {
  noteId: text('note_id').primaryKey().references(() => notes.id, { onDelete: 'cascade' }),
  vector: text('vector').notNull(), // JSON stringified array for now, can use pgvector later
})

// Clusters table for AI grouping
export const clusters = pgTable('clusters', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  noteIds: text('note_ids').notNull(), // JSON stringified array
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

// Types inferred from schema
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green'
export type NoteSource = 'text' | 'voice'
export type NoteState = 'inbox' | 'active' | 'snoozed' | 'archived'
