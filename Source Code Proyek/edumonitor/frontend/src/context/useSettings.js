import { useCallback, useState } from 'react'
import * as settingsService from '../services/settingsService'

export function useSettings() {
  const [settings, setSettings] = useState(() => settingsService.getSettings())

  const persist = useCallback((next) => {
    settingsService.saveSettings(next)
    setSettings(next)
  }, [])

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      settingsService.saveSettings(next)
      return next
    })
  }, [])

  const toggleLanguage = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, language: prev.language === 'Bahasa Indonesia' ? 'English' : 'Bahasa Indonesia' }
      settingsService.saveSettings(next)
      return next
    })
  }, [])

  const toggleNotifications = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, notifications: !prev.notifications }
      settingsService.saveSettings(next)
      return next
    })
  }, [])

  const togglePrivacy = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, privacy: !prev.privacy }
      settingsService.saveSettings(next)
      return next
    })
  }, [])

  return { settings, setSettings: updateSettings, toggleLanguage, toggleNotifications, togglePrivacy }
}
