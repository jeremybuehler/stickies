import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'

describe('Database', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should initialize with notes table', async () => {
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'"
    )
    expect(tables[0]?.values[0]?.[0]).toBe('notes')
  })
})
