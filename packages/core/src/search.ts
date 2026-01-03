import type { Database } from './db'
import type { Note } from './notes'
import { generateEmbedding, cosineSimilarity } from './embeddings'
import { getAllNotes } from './notes'

export async function indexNote(db: Database, note: Note): Promise<void> {
  const vector = await generateEmbedding(note.content)
  const buffer = Buffer.from(vector.buffer)

  db.run(
    `INSERT OR REPLACE INTO embeddings (note_id, vector) VALUES (?, ?)`,
    [note.id, buffer]
  )
}

export interface SearchResult {
  note: Note
  score: number
}

export async function searchNotes(
  db: Database,
  query: string,
  limit = 10
): Promise<SearchResult[]> {
  const queryVector = await generateEmbedding(query)
  const notes = getAllNotes(db)

  const results: SearchResult[] = []

  for (const note of notes) {
    const embResult = db.exec(
      `SELECT vector FROM embeddings WHERE note_id = ?`,
      [note.id]
    )

    if (!embResult[0]?.values[0]) continue

    const buffer = embResult[0].values[0][0] as Uint8Array
    const noteVector = new Float32Array(buffer.buffer)
    const score = cosineSimilarity(queryVector, noteVector)

    results.push({ note, score })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
