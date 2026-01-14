import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import type { RediscoveryFrequency } from '@/hooks/useDigestSettings'

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  digestEnabled: boolean
  digestTime: string
  rediscoveryFrequency: RediscoveryFrequency
  onDigestEnabledChange: (enabled: boolean) => void
  onDigestTimeChange: (time: string) => void
  onRediscoveryFrequencyChange: (frequency: RediscoveryFrequency) => void
}

const frequencyOptions: { value: RediscoveryFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
]

export function SettingsSheet({
  open,
  onOpenChange,
  digestEnabled,
  digestTime,
  rediscoveryFrequency,
  onDigestEnabledChange,
  onDigestTimeChange,
  onRediscoveryFrequencyChange,
}: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-background">
        <SheetHeader>
          <SheetTitle className="text-foreground">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Configure your daily digest and app preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Daily Digest Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2">
              Daily Digest
            </h3>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="digest-enabled" className="text-sm font-medium text-foreground">
                  Enable Daily Digest
                </label>
                <p className="text-xs text-muted-foreground">
                  Show a morning summary of your notes
                </p>
              </div>
              <Switch
                id="digest-enabled"
                checked={digestEnabled}
                onCheckedChange={onDigestEnabledChange}
              />
            </div>

            {/* Time Picker */}
            <div className={digestEnabled ? '' : 'opacity-50 pointer-events-none'}>
              <label htmlFor="digest-time" className="text-sm font-medium text-foreground block mb-1">
                Digest Time
              </label>
              <input
                type="time"
                id="digest-time"
                value={digestTime}
                onChange={(e) => onDigestTimeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                When to show your daily digest
              </p>
            </div>

            {/* Rediscovery Frequency */}
            <div className={digestEnabled ? '' : 'opacity-50 pointer-events-none'}>
              <label className="text-sm font-medium text-foreground block mb-2">
                Rediscovery Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onRediscoveryFrequencyChange(option.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      rediscoveryFrequency === option.value
                        ? 'bg-primary text-white'
                        : 'bg-white text-muted-foreground border border-border hover:bg-secondary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                How often to surface archived notes for rediscovery
              </p>
            </div>
          </div>

          {/* App Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-primary text-center">
              Stickies v0.0.1 - Quick notes, AI organized
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
