import type { SearchResult, NoteColor } from '@stickies/core'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Link2, X } from 'lucide-react'
import { useState } from 'react'

interface RelatedNotesProps {
  results: SearchResult[]
  loading?: boolean
  onLinkNote?: (noteId: string) => void
  onViewNote?: (noteId: string) => void
  onDismiss?: () => void
}

const colorMap: Record<NoteColor, string> = {
  yellow: 'bg-amber-100 border-amber-300',
  pink: 'bg-pink-100 border-pink-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
}

export function RelatedNotes({
  results,
  loading,
  onLinkNote,
  onViewNote,
  onDismiss,
}: RelatedNotesProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (results.length === 0 && !loading) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 transition-colors">
          <ChevronDown
            className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
          <span>
            {loading ? 'Finding related notes...' : `${results.length} related note${results.length !== 1 ? 's' : ''}`}
          </span>
        </CollapsibleTrigger>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-amber-500 hover:text-amber-700 transition-colors"
            title="Dismiss suggestions"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <CollapsibleContent>
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            results.map((result) => (
              <RelatedNoteCard
                key={result.note.id}
                result={result}
                onLink={onLinkNote}
                onView={onViewNote}
              />
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface RelatedNoteCardProps {
  result: SearchResult
  onLink?: (noteId: string) => void
  onView?: (noteId: string) => void
}

function RelatedNoteCard({ result, onLink, onView }: RelatedNoteCardProps) {
  const { note, score } = result
  const bgColor = colorMap[note.color] || colorMap.yellow

  // Truncate content for preview
  const preview =
    note.content.length > 80
      ? note.content.substring(0, 80) + '...'
      : note.content

  return (
    <div
      className={`${bgColor} border rounded-lg p-2 text-sm cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onView?.(note.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-gray-700 flex-1 line-clamp-2">{preview}</p>
        <div className="flex items-center gap-1 shrink-0">
          {/* Relevance indicator */}
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: `rgba(245, 158, 11, ${Math.min(score, 1)})`,
            }}
            title={`Relevance: ${Math.round(score * 100)}%`}
          />
          {onLink && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLink(note.id)
              }}
              className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-200/50 rounded transition-colors"
              title="Link to this note"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
        <span className="capitalize">{note.state}</span>
        <span>•</span>
        <span>{formatRelativeTime(note.createdAt)}</span>
      </div>
    </div>
  )
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
