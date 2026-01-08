import { useEffect, useCallback, useRef } from 'react'

interface KeyboardShortcutsConfig {
  onArchive?: () => void
  onSnooze?: () => void
  searchInputRef?: React.RefObject<HTMLInputElement>
  noteInputRef?: React.RefObject<HTMLTextAreaElement>
  enabled?: boolean
}

interface HoveredNote {
  id: string
  onArchive?: () => void
  onSnooze?: () => void
}

// Global state for the currently hovered note
let hoveredNote: HoveredNote | null = null

export function setHoveredNote(note: HoveredNote | null) {
  hoveredNote = note
}

export function useKeyboardShortcuts({
  searchInputRef,
  noteInputRef,
  enabled = true,
}: KeyboardShortcutsConfig = {}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // '/' to focus search - works even when typing (common pattern)
      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        searchInputRef?.current?.focus()
        return
      }

      // 'n' to focus note input
      if (e.key === 'n' && !isTyping) {
        e.preventDefault()
        noteInputRef?.current?.focus()
        return
      }

      // Note-specific shortcuts only when hovering a note
      if (isTyping || !hoveredNote) return

      // 'a' to archive hovered note
      if (e.key === 'a') {
        e.preventDefault()
        hoveredNote.onArchive?.()
        return
      }

      // 's' to snooze hovered note
      if (e.key === 's') {
        e.preventDefault()
        hoveredNote.onSnooze?.()
        return
      }
    },
    [enabled, searchInputRef, noteInputRef]
  )

  useEffect(() => {
    // Only enable keyboard shortcuts on desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Hook to track hover state on a note card
export function useNoteHover(
  noteId: string,
  onArchive?: () => void,
  onSnooze?: () => void
) {
  const handleMouseEnter = useCallback(() => {
    setHoveredNote({ id: noteId, onArchive, onSnooze })
  }, [noteId, onArchive, onSnooze])

  const handleMouseLeave = useCallback(() => {
    if (hoveredNote?.id === noteId) {
      setHoveredNote(null)
    }
  }, [noteId])

  return { handleMouseEnter, handleMouseLeave }
}
