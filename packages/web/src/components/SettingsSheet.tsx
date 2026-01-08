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
      <SheetContent side="right" className="bg-amber-50">
        <SheetHeader>
          <SheetTitle className="text-amber-900">Settings</SheetTitle>
          <SheetDescription className="text-amber-700">
            Configure your daily digest and app preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Daily Digest Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-amber-900 border-b border-amber-200 pb-2">
              Daily Digest
            </h3>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="digest-enabled" className="text-sm font-medium text-amber-900">
                  Enable Daily Digest
                </label>
                <p className="text-xs text-amber-600">
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
              <label htmlFor="digest-time" className="text-sm font-medium text-amber-900 block mb-1">
                Digest Time
              </label>
              <input
                type="time"
                id="digest-time"
                value={digestTime}
                onChange={(e) => onDigestTimeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-amber-600 mt-1">
                When to show your daily digest
              </p>
            </div>

            {/* Rediscovery Frequency */}
            <div className={digestEnabled ? '' : 'opacity-50 pointer-events-none'}>
              <label className="text-sm font-medium text-amber-900 block mb-2">
                Rediscovery Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onRediscoveryFrequencyChange(option.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      rediscoveryFrequency === option.value
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-2">
                How often to surface archived notes for rediscovery
              </p>
            </div>
          </div>

          {/* App Info */}
          <div className="pt-4 border-t border-amber-200">
            <p className="text-xs text-amber-500 text-center">
              Stickies v0.0.1 - Quick notes, AI organized
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
