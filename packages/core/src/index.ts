export { createDatabase, saveDatabase, type Database } from './db'
export {
  createNote,
  getNote,
  getAllNotes,
  updateNote,
  deleteNote,
  reorderNotes,
  // Smart Inbox exports
  archiveNote,
  snoozeNote,
  activateNote,
  unsnoozeNote,
  processSnoozedNotes,
  getRediscoveryCandidate,
  markAsSurfaced,
  getNotesByState,
  getInboxCount,
  type Note,
  type NoteColor,
  type NoteState,
  type NoteUpdates,
} from './notes'
export { generateEmbedding, cosineSimilarity } from './embeddings'
export { indexNote, searchNotes, type SearchResult } from './search'
export { clusterNotes, getClusters, type Cluster } from './clustering'
export const VERSION = '0.0.1'
