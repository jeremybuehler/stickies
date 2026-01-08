import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Inbox, Clock, Archive, RotateCcw, Eye } from 'lucide-react'
import type { Note, NoteColor } from '@stickies/core'

interface DailyDigestProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inboxCount: number
  dueReminders: Note[]
  rediscoveryNote: Note | null
  onViewInbox: () => void
  onOpenNote?: (noteId: string) => void
  onSnoozeNote: (noteId: string, date: Date) => void
  onArchiveNote: (noteId: string) => void
  onActivateNote: (noteId: string) => void
  onDismissRediscovery?: () => void
}

const colorMap: Record<NoteColor, string> = {
  yellow: 'bg-sticky-yellow',
  pink: 'bg-sticky-pink',
  blue: 'bg-sticky-blue',
  green: 'bg-sticky-green',
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function truncateContent(content: string, maxLength: number = 80): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

export function DailyDigest({
  open,
  onOpenChange,
  inboxCount,
  dueReminders,
  rediscoveryNote,
  onViewInbox,
  onSnoozeNote,
  onArchiveNote,
  onActivateNote,
  onDismissRediscovery,
}: DailyDigestProps) {
  const handleViewInbox = () => {
    onViewInbox()
    onOpenChange(false)
  }

  const handleSnooze = (noteId: string) => {
    // Snooze for 1 day by default from digest
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    onSnoozeNote(noteId, tomorrow)
  }

  const handleArchive = (noteId: string) => {
    onArchiveNote(noteId)
  }

  const handleActivate = (noteId: string) => {
    onActivateNote(noteId)
    onOpenChange(false)
  }

  const handleRediscoveryActivate = () => {
    if (rediscoveryNote) {
      onActivateNote(rediscoveryNote.id)
      onOpenChange(false)
    }
  }

  const handleRediscoverySnooze = () => {
    if (rediscoveryNote) {
      // Snooze for 1 day by default from digest
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      onSnoozeNote(rediscoveryNote.id, tomorrow)
    }
  }

  const handleRediscoveryDismiss = () => {
    onDismissRediscovery?.()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-amber-50 max-h-[80vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-amber-900 text-xl">Daily Digest</SheetTitle>
          <SheetDescription className="text-amber-700">
            Your morning overview of notes and reminders
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Inbox Section */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Inbox className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">Inbox</h3>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-amber-700">
                {inboxCount === 0
                  ? 'Your inbox is empty!'
                  : `You have ${inboxCount} note${inboxCount !== 1 ? 's' : ''} in your inbox`}
              </p>
              {inboxCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewInbox}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Inbox
                </Button>
              )}
            </div>
          </div>

          {/* Due Reminders Section */}
          {dueReminders.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-amber-900">Due Today</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {dueReminders.length}
                </span>
              </div>
              <div className="space-y-3">
                {dueReminders.map((note) => (
                  <div
                    key={note.id}
                    className={`${colorMap[note.color]} p-3 rounded-lg`}
                  >
                    <p className="text-gray-800 text-sm mb-2">
                      {truncateContent(note.content)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActivate(note.id)}
                        className="h-7 px-2 text-xs hover:bg-white/50"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSnooze(note.id)}
                        className="h-7 px-2 text-xs hover:bg-white/50"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Snooze
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(note.id)}
                        className="h-7 px-2 text-xs hover:bg-white/50"
                      >
                        <Archive className="w-3 h-3 mr-1" />
                        Archive
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rediscovery Section */}
          {rediscoveryNote && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Archive className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-amber-900">Rediscovery</h3>
                <span className="text-xs text-amber-500">From the archives</span>
              </div>
              <div className={`${colorMap[rediscoveryNote.color]} p-3 rounded-lg`}>
                <p className="text-gray-800 text-sm mb-1">
                  {truncateContent(rediscoveryNote.content, 120)}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Created {formatDate(rediscoveryNote.createdAt)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRediscoveryActivate}
                    className="h-7 px-2 text-xs hover:bg-white/50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRediscoverySnooze}
                    className="h-7 px-2 text-xs hover:bg-white/50"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Snooze
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRediscoveryDismiss}
                    className="h-7 px-2 text-xs hover:bg-white/50"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {inboxCount === 0 && dueReminders.length === 0 && !rediscoveryNote && (
            <div className="text-center py-8 text-amber-600">
              <p>All caught up! No new items today.</p>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Dismiss
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
