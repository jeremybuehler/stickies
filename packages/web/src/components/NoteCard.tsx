import { useState } from 'react'
import type { Note, NoteColor } from '@stickies/core'

interface Props {
  note: Note
  onUpdate?: (id: string, updates: { content?: string; color?: NoteColor }) => void
  onDelete?: (id: string) => void
  span?: 1 | 2
}

const colorMap: Record<NoteColor, string> = {
  yellow: 'bg-sticky-yellow',
  pink: 'bg-sticky-pink',
  blue: 'bg-sticky-blue',
  green: 'bg-sticky-green',
}

const colorOptions: NoteColor[] = ['yellow', 'pink', 'blue', 'green']

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

export function NoteCard({ note, onUpdate, onDelete, span = 1 }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [showColors, setShowColors] = useState(false)

  const spanClass = span === 2 ? 'col-span-2' : ''
  const bgColor = colorMap[note.color] || colorMap.yellow

  const handleSave = () => {
    if (editContent.trim() && editContent !== note.content) {
      onUpdate?.(note.id, { content: editContent.trim() })
    }
    setIsEditing(false)
  }

  const handleColorChange = (color: NoteColor) => {
    onUpdate?.(note.id, { color })
    setShowColors(false)
  }

  return (
    <div
      className={`${bgColor} ${spanClass} p-4 rounded-lg shadow-md
                  hover:shadow-lg transition-shadow relative group`}
    >
      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-white/50 rounded p-2 text-gray-800 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditContent(note.content) }}
              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="text-gray-800 whitespace-pre-wrap break-words cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {note.content}
        </p>
      )}

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

      {/* Color picker */}
      <div className="absolute top-2 left-2">
        <button
          onClick={() => setShowColors(!showColors)}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
          title="Change color"
        >
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        {showColors && (
          <div className="absolute top-8 left-0 flex gap-1 bg-white p-2 rounded shadow-lg z-10">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-6 h-6 rounded-full ${colorMap[color]} border-2 ${
                  note.color === color ? 'border-gray-800' : 'border-transparent'
                } hover:scale-110 transition-transform`}
                title={color}
              />
            ))}
          </div>
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
