const STORAGE_KEY = 'edumonitor-settings'

const defaults = {
  language: 'Bahasa Indonesia',
  notifications: true,
  privacy: true,
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
