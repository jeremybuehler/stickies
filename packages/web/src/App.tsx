import { useEffect, useState, useRef } from 'react'
import { useDatabase } from './hooks/useDatabase'
import { useNotes } from './hooks/useNotes'
import { useSearch } from './hooks/useSearch'
import { NoteInput } from './components/NoteInput'
import { NoteCard } from './components/NoteCard'
import { SearchBar } from './components/SearchBar'

export default function App() {
  const { db, loading: dbLoading, error } = useDatabase()
  const { notes, loading: notesLoading, add, update, remove, reorder, refresh } = useNotes(db)
  const { results, loading: searchLoading, search, clear } = useSearch(db)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    if (db) refresh()
  }, [db, refresh])

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedId(noteId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', noteId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
    dragCounter.current = 0
  }

  const handleDragEnter = (e: React.DragEvent, noteId: string) => {
    e.preventDefault()
    dragCounter.current++
    if (noteId !== draggedId) {
      setDragOverId(noteId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    dragCounter.current = 0

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const currentNotes = results ? results.map((r) => r.note) : notes
    const noteIds = currentNotes.map((n) => n.id)
    const fromIndex = noteIds.indexOf(draggedId)
    const toIndex = noteIds.indexOf(targetId)

    if (fromIndex === -1 || toIndex === -1) return

    // Reorder the array
    const newOrder = [...noteIds]
    newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, draggedId)

    await reorder(newOrder)
    setDraggedId(null)
    setDragOverId(null)
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load database: {error.message}
      </div>
    )
  }

  if (dbLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-amber-600">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    )
  }

  const displayNotes = results ? results.map((r) => r.note) : notes

  // Determine if a note should span 2 columns based on content length
  const getSpan = (content: string): 1 | 2 => {
    return content.length > 80 ? 2 : 1
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Stickies</h1>
        <p className="text-amber-700">Quick notes, AI organized</p>
      </header>

      <div className="mb-4">
        <NoteInput onSubmit={add} disabled={notesLoading} />
      </div>

      <div className="mb-6">
        <SearchBar onSearch={search} onClear={clear} loading={searchLoading} />
      </div>

      {results && (
        <p className="text-sm text-amber-600 mb-4">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      {displayNotes.length === 0 ? (
        <p className="text-center text-amber-400 py-12">
          {results ? 'No matching notes found.' : 'No notes yet. Jot something down!'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {displayNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={update}
              onDelete={remove}
              span={getSpan(note.content)}
              isDragging={draggedId === note.id}
              isDragOver={dragOverId === note.id}
              onDragStart={(e) => handleDragStart(e, note.id)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, note.id)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
