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

  it('should cluster related notes together', async () => {
    // Food related
    const n1 = createNote(db, 'Buy milk and eggs')
    const n2 = createNote(db, 'Get groceries from store')
    // Work related
    const n3 = createNote(db, 'Finish quarterly report')
    const n4 = createNote(db, 'Schedule team meeting')

    for (const note of [n1, n2, n3, n4]) {
      await indexNote(db, note)
    }

    const clusters = await clusterNotes(db, 2)
    expect(clusters.length).toBe(2)

    // Notes about same topic should be in same cluster
    const cluster1NoteIds = clusters[0].noteIds
    const cluster2NoteIds = clusters[1].noteIds

    // Either n1&n2 together OR n3&n4 together (depends on clustering)
    const foodTogether =
      (cluster1NoteIds.includes(n1.id) && cluster1NoteIds.includes(n2.id)) ||
      (cluster2NoteIds.includes(n1.id) && cluster2NoteIds.includes(n2.id))

    expect(foodTogether).toBe(true)
  }, 60000)
})
