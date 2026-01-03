import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'
import { createNote } from './notes'
import { indexNote, searchNotes } from './search'

describe('Search', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should index and search notes', async () => {
    const note1 = createNote(db, 'Buy groceries: milk, eggs, bread')
    const note2 = createNote(db, 'Schedule dentist appointment')
    const note3 = createNote(db, 'Pick up dry cleaning')

    await indexNote(db, note1)
    await indexNote(db, note2)
    await indexNote(db, note3)

    const results = await searchNotes(db, 'food shopping')
    expect(results[0].note.id).toBe(note1.id) // Groceries most relevant
  }, 60000)
})
