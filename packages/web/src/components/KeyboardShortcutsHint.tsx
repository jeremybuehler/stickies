import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

export function KeyboardShortcutsHint() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Only show on desktop
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobile(mobile)
  }, [])

  if (isMobile) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible ? (
        <div className="bg-white rounded-lg shadow-lg border border-border p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-foreground text-sm">Keyboard Shortcuts</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Focus note input</span>
              <kbd className="px-2 py-0.5 bg-secondary rounded text-foreground font-mono text-xs">n</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Focus search</span>
              <kbd className="px-2 py-0.5 bg-secondary rounded text-foreground font-mono text-xs">/</kbd>
            </div>
            <div className="border-t border-border my-2" />
            <p className="text-xs text-muted-foreground mb-2">When hovering a note:</p>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Archive note</span>
              <kbd className="px-2 py-0.5 bg-secondary rounded text-foreground font-mono text-xs">a</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Snooze note</span>
              <kbd className="px-2 py-0.5 bg-secondary rounded text-foreground font-mono text-xs">s</kbd>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="p-3 bg-white rounded-full shadow-lg border border-border hover:bg-background transition-colors group"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-5 h-5 text-muted-foreground group-hover:text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
