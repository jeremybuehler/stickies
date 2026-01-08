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
        <div className="bg-white rounded-lg shadow-lg border border-amber-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-amber-900 text-sm">Keyboard Shortcuts</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-amber-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-amber-600" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-amber-600">Focus note input</span>
              <kbd className="px-2 py-0.5 bg-amber-100 rounded text-amber-800 font-mono text-xs">n</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-amber-600">Focus search</span>
              <kbd className="px-2 py-0.5 bg-amber-100 rounded text-amber-800 font-mono text-xs">/</kbd>
            </div>
            <div className="border-t border-amber-100 my-2" />
            <p className="text-xs text-amber-400 mb-2">When hovering a note:</p>
            <div className="flex justify-between gap-8">
              <span className="text-amber-600">Archive note</span>
              <kbd className="px-2 py-0.5 bg-amber-100 rounded text-amber-800 font-mono text-xs">a</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-amber-600">Snooze note</span>
              <kbd className="px-2 py-0.5 bg-amber-100 rounded text-amber-800 font-mono text-xs">s</kbd>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="p-3 bg-white rounded-full shadow-lg border border-amber-200 hover:bg-amber-50 transition-colors group"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-5 h-5 text-amber-600 group-hover:text-amber-700" />
        </button>
      )}
    </div>
  )
}
