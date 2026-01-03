import type { Note } from '@stickies/core'

interface Props {
  note: Note
  onDelete?: (id: string) => void
}

const colors = [
  'bg-sticky-yellow',
  'bg-sticky-pink',
  'bg-sticky-blue',
  'bg-sticky-green',
]

function getColor(id: string): string {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NoteCard({ note, onDelete }: Props) {
  return (
    <div
      className={`${getColor(note.id)} p-4 rounded-lg shadow-md
                  hover:shadow-lg transition-shadow relative group`}
    >
      <p className="text-gray-800 whitespace-pre-wrap break-words">
        {note.content}
      </p>
      <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
        <span>{formatTime(note.createdAt)}</span>
        {note.source === 'voice' && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            voice
          </span>
        )}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(note.id)}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100
                     hover:bg-black/10 transition-opacity"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
