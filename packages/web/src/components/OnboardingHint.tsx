import { useState, useEffect } from 'react'
import { X, Lightbulb } from 'lucide-react'

const STORAGE_KEY = 'stickies-onboarding-dismissed'

interface OnboardingHintProps {
  hasNotes: boolean
}

export function OnboardingHint({ hasNotes }: OnboardingHintProps) {
  const [isDismissed, setIsDismissed] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    setIsDismissed(dismissed === 'true')
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsDismissed(true)
  }

  // Only show when there are no notes and user hasn't dismissed
  if (hasNotes || isDismissed) return null

  return (
    <div className="mb-6 bg-gradient-to-r from-secondary to-background rounded-xl p-4 border border-border animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm mb-1">
            Welcome to Smart Inbox
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            New notes land in your <strong>Inbox</strong>. Process them by making
            <strong> active</strong>, <strong>snoozing</strong> for later, or
            <strong> archiving</strong> when done.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-secondary/50 rounded transition-colors"
          aria-label="Dismiss hint"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
