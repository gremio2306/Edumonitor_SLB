import { teachers as initialTeachers } from '../data/mockData'
import { createInitials } from '../utils/helpers'

const STORAGE_KEY = 'edumonitor-teachers'

function createDefaults() {
  return initialTeachers.map((teacher, index) => {
    const cleanName = teacher.name.replace(/^Bpk\.\s*/i, '').replace(/^Ibu\s*/i, '').trim()
    const emailName = cleanName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '.')
    return {
      ...teacher,
      email: teacher.email || `${emailName || `guru${index + 1}`}@edumonitor.id`,
      phone: teacher.phone || `0812-1000-${String(index + 1).padStart(4, '0')}`,
    }
  })
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

export function getAllTeachers() {
  return read()
}

export function createTeacher(teacher) {
  const items = read()
  const newTeacher = {
    ...teacher,
    id: `GRU-${String(Date.now()).slice(-8)}`,
    initials: createInitials(teacher.name),
  }
  write([newTeacher, ...items])
  return newTeacher
}

export function updateTeacher(id, changes) {
  const items = read()
  const updated = items.map((t) =>
    String(t.id) === String(id)
      ? { ...t, ...changes, id: t.id, initials: createInitials(changes.name || t.name) }
      : t,
  )
  write(updated)
  return updated.find((t) => String(t.id) === String(id))
}

export function deleteTeacher(id) {
  const items = read()
  write(items.filter((t) => String(t.id) !== String(id)))
}
