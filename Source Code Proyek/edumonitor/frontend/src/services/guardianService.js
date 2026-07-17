import { guardians as initialGuardians, initialStudents } from '../data/mockData'
import { createInitials } from '../utils/helpers'

const STORAGE_KEY = 'edumonitor-guardians'

function createDefaults() {
  return initialGuardians.map((g, index) => ({
    ...g,
    studentId: initialStudents[index] ? initialStudents[index].id : null,
    address: g.address || '-',
    phone: g.phone || '-',
  }))
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    const defaults = createDefaults()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  } catch {
    return createDefaults()
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllGuardians() {
  return read()
}

export function createGuardian(guardian) {
  const items = read()
  const newGuardian = {
    ...guardian,
    id: `WLI-${String(Date.now()).slice(-8)}`,
    initials: createInitials(guardian.name),
  }
  write([newGuardian, ...items])
  return newGuardian
}

export function updateGuardian(id, changes) {
  const items = read()
  const updated = items.map((g) =>
    String(g.id) === String(id)
      ? { ...g, ...changes, id: g.id, initials: createInitials(changes.name || g.name) }
      : g,
  )
  write(updated)
  return updated.find((g) => String(g.id) === String(id))
}

export function deleteGuardian(id) {
  const items = read()
  write(items.filter((g) => String(g.id) !== String(id)))
}
