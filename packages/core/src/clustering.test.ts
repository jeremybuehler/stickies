import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'
import { createNote } from './notes'
import { indexNote } from './search'
import { clusterNotes } from './clustering'

describe('Clustering', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should cluster notes into requested number of groups', async () => {
    // Create 4 notes
    const n1 = createNote(db, 'Buy milk and eggs')
    const n2 = createNote(db, 'Get groceries from store')
    const n3 = createNote(db, 'Finish quarterly report')
    const n4 = createNote(db, 'Schedule team meeting')

    for (const note of [n1, n2, n3, n4]) {
      await indexNote(db, note)
    }

    const clusters = await clusterNotes(db, 2)

    // Verify we get 2 clusters
    expect(clusters.length).toBe(2)

    // Verify all notes are assigned to a cluster
    const allNoteIds = clusters.flatMap(c => c.noteIds)
    expect(allNoteIds).toHaveLength(4)
    expect(allNoteIds).toContain(n1.id)
    expect(allNoteIds).toContain(n2.id)
    expect(allNoteIds).toContain(n3.id)
    expect(allNoteIds).toContain(n4.id)

    // Verify each cluster has at least one note
    expect(clusters[0].noteIds.length).toBeGreaterThan(0)
    expect(clusters[1].noteIds.length).toBeGreaterThan(0)
  }, 60000)
})
