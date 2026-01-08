import { Inbox, FileText, CheckCircle, Archive } from 'lucide-react'
import type { ViewFilter } from './ViewToggle'

interface EmptyStateProps {
  viewFilter: ViewFilter
  isSearchResult?: boolean
}

const emptyStateConfig: Record<ViewFilter, { icon: typeof Inbox; title: string; description: string }> = {
  all: {
    icon: FileText,
    title: 'No notes yet',
    description: "Jot something down!",
  },
  inbox: {
    icon: Inbox,
    title: 'Inbox zero!',
    description: 'All notes have been processed.',
  },
  active: {
    icon: CheckCircle,
    title: 'No active notes',
    description: 'Create one or move from inbox.',
  },
  snoozed: {
    icon: FileText,
    title: 'No snoozed notes',
    description: 'Snooze notes to see them here later.',
  },
  archived: {
    icon: Archive,
    title: 'No archived notes yet',
    description: 'Archive notes to keep them out of the way.',
  },
}

export function EmptyState({ viewFilter, isSearchResult }: EmptyStateProps) {
  if (isSearchResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-amber-600 font-medium">No matching notes found</p>
        <p className="text-amber-400 text-sm mt-1">Try a different search term</p>
      </div>
    )
  }

  const config = emptyStateConfig[viewFilter]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-amber-600 font-medium">{config.title}</p>
      <p className="text-amber-400 text-sm mt-1">{config.description}</p>
    </div>
  )
}
