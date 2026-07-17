import { initialStudents } from '../data/mockData'

const STORAGE_KEY = 'edumonitor-students'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents))
    return initialStudents
  } catch {
    return initialStudents
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllStudents() {
  return read()
}

export function createStudent(student) {
  const items = read()
  const newStudent = { ...student, id: String(Date.now()).slice(-8) }
  write([newStudent, ...items])
  return newStudent
}

export function updateStudent(id, changes) {
  const items = read()
  const updated = items.map((s) =>
    String(s.id) === String(id) ? { ...s, ...changes, id: s.id } : s,
  )
  write(updated)
  return updated.find((s) => String(s.id) === String(id))
}

export function deleteStudent(id) {
  const items = read()
  write(items.filter((s) => String(s.id) !== String(id)))
}
