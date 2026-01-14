import { useEffect, useState, useRef, useCallback } from 'react'
import { useUser, SignIn, UserButton } from '@clerk/clerk-react'
import { useNeonNotes } from './hooks/useNeonNotes'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDigestSettings } from './hooks/useDigestSettings'
import { useToast } from '@/hooks/useToast'
import { NoteInput } from './components/NoteInput'
import { NoteCard } from './components/NoteCard'
import { ViewToggle, type ViewFilter } from './components/ViewToggle'
import { OnboardingHint } from './components/OnboardingHint'
import { EmptyState } from './components/EmptyState'
import { KeyboardShortcutsHint } from './components/KeyboardShortcutsHint'
import { DailyDigest } from './components/DailyDigest'
import { SettingsSheet } from './components/SettingsSheet'
import { Toaster } from '@/components/ui/toaster'
import { ToastAction } from '@/components/ui/toast'
import { Settings } from 'lucide-react'
import type { Note, NoteColor } from '../../../db/schema'

// Check if Neon is configured
const isNeonConfigured = !!import.meta.env.VITE_DATABASE_URL
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const isDev = import.meta.env.DEV

export default function App() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [devBypass, setDevBypass] = useState(false)

  // Notes from Neon
  const {
    notes,
    loading: notesLoading,
    error: notesError,
    add,
    update,
    remove,
    reorder,
    refresh,
    archive,
    snooze,
    activate,
    unarchive,
    processSnoozed,
    getInboxCount,
    getRediscoveryCandidate,
    markAsSurfaced,
    searchNotes,
  } = useNeonNotes(devBypass)

  // Toast
  const { toast } = useToast()

  // View filter
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')

  // Inbox count
  const inboxCount = getInboxCount()

  // Digest settings
  const {
    settings: digestSettings,
    setDigestEnabled,
    setDigestTime,
    setRediscoveryFrequency,
  } = useDigestSettings()

  // Settings and Digest sheet state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [digestOpen, setDigestOpen] = useState(false)
  const [rediscoveryNote, setRediscoveryNote] = useState<Note | null>(null)
  const [dueReminders, setDueReminders] = useState<Note[]>([])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize keyboard shortcuts (desktop only)
  useKeyboardShortcuts({
    searchInputRef,
    noteInputRef,
    enabled: true,
  })

  // Process snoozed notes on app load
  useEffect(() => {
    const processAndNotify = async () => {
      const wokenNoteIds = await processSnoozed()
      if (wokenNoteIds && wokenNoteIds.length > 0) {
        toast({
          title: `${wokenNoteIds.length} snoozed note${wokenNoteIds.length > 1 ? 's' : ''} woke up`,
          description: 'Check your inbox to review them.',
        })
      }
    }
    if (isSignedIn) {
      processAndNotify()
    }
  }, [isSignedIn, processSnoozed, toast])

  // Check if daily digest should be shown
  useEffect(() => {
    if (!digestSettings.digestEnabled || !isSignedIn) return

    const checkDigestTime = async () => {
      const now = new Date()
      const [targetHour, targetMinute] = digestSettings.digestTime.split(':').map(Number)
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      const targetTotalMinutes = targetHour * 60 + targetMinute
      const currentTotalMinutes = currentHour * 60 + currentMinute
      const diff = Math.abs(currentTotalMinutes - targetTotalMinutes)

      if (diff <= 5) {
        const lastShownKey = 'stickies-last-digest-shown'
        const lastShown = localStorage.getItem(lastShownKey)
        const today = now.toDateString()

        if (lastShown !== today) {
          setDigestOpen(true)
          localStorage.setItem(lastShownKey, today)

          // Fetch rediscovery note
          if (digestSettings.rediscoveryFrequency !== 'never') {
            const candidate = await getRediscoveryCandidate()
            if (candidate) {
              setRediscoveryNote(candidate)
              await markAsSurfaced(candidate.id)
            }
          }

          // Get due reminders
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999)

          const due = notes.filter(
            (n) =>
              n.state === 'snoozed' &&
              n.snoozedUntil &&
              n.snoozedUntil >= todayStart &&
              n.snoozedUntil <= todayEnd
          )
          setDueReminders(due)
        }
      }
    }

    checkDigestTime()
    const interval = setInterval(checkDigestTime, 60000)
    return () => clearInterval(interval)
  }, [digestSettings, notes, isSignedIn, getRediscoveryCandidate, markAsSurfaced])

  // Handler to manually show digest
  const handleShowDigest = useCallback(async () => {
    if (digestSettings.rediscoveryFrequency !== 'never') {
      const candidate = await getRediscoveryCandidate()
      if (candidate) {
        setRediscoveryNote(candidate)
        await markAsSurfaced(candidate.id)
      }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const due = notes.filter(
      (n) =>
        n.state === 'snoozed' &&
        n.snoozedUntil &&
        n.snoozedUntil >= todayStart &&
        n.snoozedUntil <= todayEnd
    )
    setDueReminders(due)
    setDigestOpen(true)
  }, [notes, digestSettings.rediscoveryFrequency, getRediscoveryCandidate, markAsSurfaced])

  const handleViewInbox = useCallback(() => {
    setViewFilter('inbox')
  }, [])

  const handleDismissRediscovery = useCallback(() => {
    setRediscoveryNote(null)
  }, [])

  // Search handler
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)
      if (!query.trim()) {
        setSearchResults(null)
        return
      }
      setSearchLoading(true)
      try {
        const results = await searchNotes(query)
        setSearchResults(results)
      } finally {
        setSearchLoading(false)
      }
    },
    [searchNotes]
  )

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults(null)
  }, [])

  // Drag handlers
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

    const displayNotes = getDisplayNotes()
    const noteIds = displayNotes.map((n) => n.id)
    const fromIndex = noteIds.indexOf(draggedId)
    const toIndex = noteIds.indexOf(targetId)

    if (fromIndex === -1 || toIndex === -1) return

    const newOrder = [...noteIds]
    newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, draggedId)

    await reorder(newOrder)
    setDraggedId(null)
    setDragOverId(null)
  }

  // Add note handler
  const handleAdd = async (content: string, source: 'text' | 'voice' = 'text') => {
    await add(content, source)
  }

  // Action handlers
  const handleArchive = async (id: string) => {
    await archive(id)
    toast({
      title: 'Note archived',
      action: (
        <ToastAction altText="Undo" onClick={() => unarchive(id)}>
          Undo
        </ToastAction>
      ),
    })
  }

  const handleSnooze = async (id: string, date: Date) => {
    await snooze(id, date)
    const formattedDate = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    toast({
      title: `Note snoozed until ${formattedDate}`,
    })
  }

  const handleActivate = async (id: string) => {
    await activate(id)
  }

  const handleUnarchive = async (id: string) => {
    await unarchive(id)
  }

  const handleViewRelatedNote = useCallback(
    (noteId: string) => {
      const noteElement = document.querySelector(`[data-note-id="${noteId}"]`)
      if (noteElement) {
        noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        noteElement.classList.add('ring-2', 'ring-primary')
        setTimeout(() => {
          noteElement.classList.remove('ring-2', 'ring-primary')
        }, 2000)
      } else {
        setViewFilter('all')
        toast({
          title: 'Switched to All view',
          description: 'Note might have been filtered.',
        })
      }
    },
    [toast]
  )

  const handleLinkNote = useCallback(
    (noteId: string) => {
      toast({
        title: 'Note linked',
        description: 'This note has been linked.',
      })
    },
    [toast]
  )

  const getSpan = (content: string): 1 | 2 => {
    return content.length > 80 ? 2 : 1
  }

  const getDisplayNotes = () => {
    if (searchResults) return searchResults
    if (viewFilter === 'all') return notes.filter((n) => n.state !== 'archived')
    return notes.filter((n) => n.state === viewFilter)
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  // Not configured
  if (!isNeonConfigured) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-4">Stickies</h1>
          <p className="text-muted-foreground mb-4">Database not configured.</p>
          <p className="text-sm text-muted-foreground">
            Set <code className="bg-secondary px-1 rounded">VITE_DATABASE_URL</code> to your Neon connection string.
          </p>
        </div>
      </div>
    )
  }

  // Auth required (unless dev bypass)
  if (!isSignedIn && !devBypass) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">Stickies</h1>
          <p className="text-muted-foreground">Quick notes, AI organized</p>
        </header>
        {isClerkConfigured ? (
          <div className="flex flex-col items-center">
            <SignIn />
            {/* Cloudflare Turnstile CAPTCHA placeholder - required for bot protection */}
            <div id="clerk-captcha" className="mt-4" />
            {isDev && (
              <button
                onClick={() => setDevBypass(true)}
                className="mt-6 text-primary hover:text-foreground text-sm underline"
              >
                Skip auth (dev mode)
              </button>
            )}
          </div>
        ) : (
          <div className="text-center max-w-md">
            <p className="text-muted-foreground mb-4">Authentication not configured.</p>
            <p className="text-sm text-muted-foreground">
              Set <code className="bg-secondary px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> to enable sign in.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (notesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-8 text-red-600">Failed to load notes: {notesError.message}</div>
      </div>
    )
  }

  const displayNotes = getDisplayNotes()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <header className="mb-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Stickies</h1>
              <p className="text-muted-foreground">Quick notes, AI organized</p>
            </div>
            {viewFilter !== 'inbox' && inboxCount > 0 && (
              <button
                onClick={() => setViewFilter('inbox')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-background0 text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors animate-in fade-in duration-200"
                title="Go to Inbox"
              >
                <span className="sr-only">Inbox:</span>
                {inboxCount}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        <OnboardingHint hasNotes={notes.length > 0} />

        <div className="mb-4">
          <NoteInput onSubmit={handleAdd} disabled={notesLoading} inputRef={noteInputRef} />
        </div>

        <div className="mb-4">
          <ViewToggle value={viewFilter} onChange={setViewFilter} inboxCount={inboxCount} />
        </div>

        {/* Simple search bar */}
        <div className="mb-6">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-4 py-2 bg-white/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchResults && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              <button onClick={handleClearSearch} className="text-sm text-primary hover:text-muted-foreground">
                Clear
              </button>
            </div>
          )}
        </div>

        {displayNotes.length === 0 ? (
          <EmptyState viewFilter={viewFilter} isSearchResult={!!searchResults} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {displayNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={{
                  ...note,
                  createdAt: note.createdAt instanceof Date ? note.createdAt.getTime() : note.createdAt,
                  updatedAt: note.updatedAt instanceof Date ? note.updatedAt.getTime() : note.updatedAt,
                  snoozedUntil: note.snoozedUntil instanceof Date ? note.snoozedUntil.getTime() : note.snoozedUntil ?? undefined,
                  lastSurfacedAt: note.lastSurfacedAt instanceof Date ? note.lastSurfacedAt.getTime() : note.lastSurfacedAt ?? undefined,
                  linkedTo: note.linkedTo ?? undefined,
                  rawTranscript: note.rawTranscript ?? undefined,
                }}
                onUpdate={update}
                onDelete={remove}
                onArchive={handleArchive}
                onSnooze={handleSnooze}
                onActivate={handleActivate}
                onUnarchive={handleUnarchive}
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
      <KeyboardShortcutsHint />
      <Toaster />

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        digestEnabled={digestSettings.digestEnabled}
        digestTime={digestSettings.digestTime}
        rediscoveryFrequency={digestSettings.rediscoveryFrequency}
        onDigestEnabledChange={setDigestEnabled}
        onDigestTimeChange={setDigestTime}
        onRediscoveryFrequencyChange={setRediscoveryFrequency}
      />

      <DailyDigest
        open={digestOpen}
        onOpenChange={setDigestOpen}
        inboxCount={inboxCount}
        dueReminders={dueReminders.map((n) => ({
          ...n,
          createdAt: n.createdAt instanceof Date ? n.createdAt.getTime() : n.createdAt,
          updatedAt: n.updatedAt instanceof Date ? n.updatedAt.getTime() : n.updatedAt,
          snoozedUntil: n.snoozedUntil instanceof Date ? n.snoozedUntil.getTime() : n.snoozedUntil ?? undefined,
          lastSurfacedAt: n.lastSurfacedAt instanceof Date ? n.lastSurfacedAt.getTime() : n.lastSurfacedAt ?? undefined,
          linkedTo: n.linkedTo ?? undefined,
          rawTranscript: n.rawTranscript ?? undefined,
        }))}
        rediscoveryNote={
          rediscoveryNote
            ? {
                ...rediscoveryNote,
                createdAt:
                  rediscoveryNote.createdAt instanceof Date
                    ? rediscoveryNote.createdAt.getTime()
                    : rediscoveryNote.createdAt,
                updatedAt:
                  rediscoveryNote.updatedAt instanceof Date
                    ? rediscoveryNote.updatedAt.getTime()
                    : rediscoveryNote.updatedAt,
                snoozedUntil:
                  rediscoveryNote.snoozedUntil instanceof Date
                    ? rediscoveryNote.snoozedUntil.getTime()
                    : rediscoveryNote.snoozedUntil ?? undefined,
                lastSurfacedAt:
                  rediscoveryNote.lastSurfacedAt instanceof Date
                    ? rediscoveryNote.lastSurfacedAt.getTime()
                    : rediscoveryNote.lastSurfacedAt ?? undefined,
                linkedTo: rediscoveryNote.linkedTo ?? undefined,
                rawTranscript: rediscoveryNote.rawTranscript ?? undefined,
              }
            : null
        }
        onViewInbox={handleViewInbox}
        onSnoozeNote={handleSnooze}
        onArchiveNote={handleArchive}
        onActivateNote={handleActivate}
        onDismissRediscovery={handleDismissRediscovery}
      />
    </div>
  )
}
