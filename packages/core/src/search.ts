import type { Database } from './db'
import type { Note } from './notes'
import { getAllNotes } from './notes'

export async function indexNote(_db: Database, _note: Note): Promise<void> {
  // Embedding indexing disabled until Vite + transformers.js compatibility is resolved
  // TODO: Re-enable with web worker solution
}

export interface SearchResult {
  note: Note
  score: number
}

// Simple text-based search (case-insensitive)
export async function searchNotes(
  db: Database,
  query: string,
  limit = 10
): Promise<SearchResult[]> {
  const notes = getAllNotes(db)
  const queryLower = query.toLowerCase().trim()

  if (!queryLower) return []

  const results: SearchResult[] = []
  const queryWords = queryLower.split(/\s+/)

  for (const note of notes) {
    const contentLower = note.content.toLowerCase()

    // Calculate score based on word matches
    let matchedWords = 0
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        matchedWords++
      }
    }

    if (matchedWords > 0) {
      // Score: percentage of query words matched + boost for exact phrase match
      let score = matchedWords / queryWords.length
      if (contentLower.includes(queryLower)) {
        score += 0.5 // Boost for exact phrase match
      }
      results.push({ note, score })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
