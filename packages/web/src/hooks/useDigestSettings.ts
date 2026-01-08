import { useState, useCallback, useEffect } from 'react'

export type RediscoveryFrequency = 'daily' | 'weekly' | 'never'

export interface DigestSettings {
  digestEnabled: boolean
  digestTime: string // HH:MM format
  rediscoveryFrequency: RediscoveryFrequency
}

const STORAGE_KEY = 'stickies-digest-settings'

const defaultSettings: DigestSettings = {
  digestEnabled: true,
  digestTime: '09:00',
  rediscoveryFrequency: 'daily',
}

function loadSettings(): DigestSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...defaultSettings,
        ...parsed,
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return defaultSettings
}

function saveSettings(settings: DigestSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage errors
  }
}

export function useDigestSettings() {
  const [settings, setSettings] = useState<DigestSettings>(loadSettings)

  // Sync with localStorage when settings change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const setDigestEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, digestEnabled: enabled }))
  }, [])

  const setDigestTime = useCallback((time: string) => {
    setSettings((prev) => ({ ...prev, digestTime: time }))
  }, [])

  const setRediscoveryFrequency = useCallback((frequency: RediscoveryFrequency) => {
    setSettings((prev) => ({ ...prev, rediscoveryFrequency: frequency }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  return {
    settings,
    setDigestEnabled,
    setDigestTime,
    setRediscoveryFrequency,
    resetToDefaults,
  }
}
