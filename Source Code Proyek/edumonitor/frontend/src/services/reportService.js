import { initialReports } from '../data/mockData'

const STORAGE_KEY = 'edumonitor-reports'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports))
    return initialReports
  } catch {
    return initialReports
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllReports() {
  return read()
}

export function createReport(report) {
  const items = read()
  const newReport = { ...report, id: Date.now() }
  write([newReport, ...items])
  return newReport
}

export function updateReport(id, changes) {
  const items = read()
  const updated = items.map((r) =>
    String(r.id) === String(id) ? { ...r, ...changes, id: r.id } : r,
  )
  write(updated)
  return updated.find((r) => String(r.id) === String(id))
}

export function deleteReport(id) {
  const items = read()
  write(items.filter((r) => String(r.id) !== String(id)))
}
