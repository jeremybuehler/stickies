import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'
import { createNote, getNote, getAllNotes, deleteNote, type Note } from './notes'

describe('Notes', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should create a note', () => {
    const note = createNote(db, 'Buy milk')
    expect(note.content).toBe('Buy milk')
    expect(note.source).toBe('text')
    expect(note.id).toBeDefined()
  })

  it('should get a note by id', () => {
    const created = createNote(db, 'Test note')
    const fetched = getNote(db, created.id)
    expect(fetched?.content).toBe('Test note')
  })

  it('should get all notes', () => {
    createNote(db, 'Note 1')
    createNote(db, 'Note 2')
    const notes = getAllNotes(db)
    expect(notes.length).toBe(2)
  })

  it('should delete a note', () => {
    const note = createNote(db, 'To delete')
    deleteNote(db, note.id)
    expect(getNote(db, note.id)).toBeNull()
  })
})
