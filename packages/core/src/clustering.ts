import { v4 as uuid } from 'uuid'
import type { Database } from './db'
import { getAllNotes, type Note } from './notes'

export interface Cluster {
  id: string
  name: string
  description?: string
  noteIds: string[]
  createdAt: number
  updatedAt: number
}

interface NoteWithVector {
  note: Note
  vector: Float32Array
}

function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2
  }
  return Math.sqrt(sum)
}

function kMeans(
  items: NoteWithVector[],
  k: number,
  maxIterations = 100
): string[][] {
  if (items.length === 0) return []
  if (items.length <= k) {
    return items.map((item) => [item.note.id])
  }

  const dim = items[0].vector.length

  // Initialize centroids randomly
  const centroids: Float32Array[] = []
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  for (let i = 0; i < k; i++) {
    centroids.push(new Float32Array(shuffled[i].vector))
  }

  let assignments: number[] = new Array(items.length).fill(0)

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    const newAssignments = items.map((item) => {
      let minDist = Infinity
      let minIdx = 0
      for (let c = 0; c < k; c++) {
        const dist = euclideanDistance(item.vector, centroids[c])
        if (dist < minDist) {
          minDist = dist
          minIdx = c
        }
      }
      return minIdx
    })

    // Check convergence
    if (newAssignments.every((a, i) => a === assignments[i])) break
    assignments = newAssignments

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterItems = items.filter((_, i) => assignments[i] === c)
      if (clusterItems.length === 0) continue

      const newCentroid = new Float32Array(dim)
      for (const item of clusterItems) {
        for (let d = 0; d < dim; d++) {
          newCentroid[d] += item.vector[d]
        }
      }
      for (let d = 0; d < dim; d++) {
        newCentroid[d] /= clusterItems.length
      }
      centroids[c] = newCentroid
    }
  }

  // Group by cluster
  const groups: string[][] = Array.from({ length: k }, () => [])
  items.forEach((item, i) => {
    groups[assignments[i]].push(item.note.id)
  })

  return groups.filter((g) => g.length > 0)
}

export async function clusterNotes(
  db: Database,
  k = 5
): Promise<Cluster[]> {
  const notes = getAllNotes(db)
  const notesWithVectors: NoteWithVector[] = []

  for (const note of notes) {
    const embResult = db.exec(
      `SELECT vector FROM embeddings WHERE note_id = ?`,
      [note.id]
    )
    if (!embResult[0]?.values[0]) continue

    const buffer = embResult[0].values[0][0] as Uint8Array
    const vector = new Float32Array(buffer.buffer)
    notesWithVectors.push({ note, vector })
  }

  const actualK = Math.min(k, notesWithVectors.length)
  const groups = kMeans(notesWithVectors, actualK)

  const now = Date.now()
  const clusters: Cluster[] = groups.map((noteIds, i) => ({
    id: uuid(),
    name: `Cluster ${i + 1}`, // Will be named by LLM later
    noteIds,
    createdAt: now,
    updatedAt: now,
  }))

  // Save clusters to DB
  db.run(`DELETE FROM clusters`)
  for (const cluster of clusters) {
    db.run(
      `INSERT INTO clusters (id, name, description, note_ids, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cluster.id,
        cluster.name,
        cluster.description ?? null,
        JSON.stringify(cluster.noteIds),
        cluster.createdAt,
        cluster.updatedAt,
      ]
    )
  }

  return clusters
}

export function getClusters(db: Database): Cluster[] {
  const result = db.exec(
    `SELECT id, name, description, note_ids, created_at, updated_at FROM clusters`
  )
  if (!result[0]) return []

  return result[0].values.map((row) => ({
    id: row[0] as string,
    name: row[1] as string,
    description: (row[2] as string | null) ?? undefined,
    noteIds: JSON.parse(row[3] as string),
    createdAt: row[4] as number,
    updatedAt: row[5] as number,
  }))
}
