import { useEffect } from 'react'
import { useDatabase } from './hooks/useDatabase'
import { useNotes } from './hooks/useNotes'
import { NoteInput } from './components/NoteInput'
import { NoteCard } from './components/NoteCard'

export default function App() {
  const { db, loading: dbLoading, error } = useDatabase()
  const { notes, loading: notesLoading, add, remove, refresh } = useNotes(db)

  useEffect(() => {
    if (db) refresh()
  }, [db, refresh])

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

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Stickies</h1>
        <p className="text-amber-700">Quick notes, AI organized</p>
      </header>

      <div className="mb-8">
        <NoteInput onSubmit={add} disabled={notesLoading} />
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-amber-400 py-12">
          No notes yet. Jot something down!
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
