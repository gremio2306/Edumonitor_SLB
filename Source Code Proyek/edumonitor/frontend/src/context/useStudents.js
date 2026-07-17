import { useCallback, useState } from 'react'
import * as studentService from '../services/studentService'

export function useStudents(addNotification, showToast) {
  const [students, setStudents] = useState(() => studentService.getAllStudents())

  const addStudent = useCallback((student) => {
    const created = studentService.createStudent(student)
    setStudents((prev) => [created, ...prev])
    addNotification('Siswa Baru', `Siswa baru ditambahkan: ${student.name}`, 'info')
    showToast('Data siswa berhasil ditambahkan')
  }, [addNotification, showToast])

  const updateStudent = useCallback((studentId, changes) => {
    const current = students.find((s) => String(s.id) === String(studentId))
    studentService.updateStudent(studentId, changes)
    setStudents((prev) =>
      prev.map((s) => (String(s.id) === String(studentId) ? { ...s, ...changes, id: s.id } : s)),
    )
    addNotification('Data Siswa Diperbarui', `Data siswa diperbarui: ${current?.name || studentId}`, 'info')
    showToast('Data siswa berhasil diperbarui', 'success')
  }, [students, addNotification, showToast])

  const deleteStudent = useCallback((studentId) => {
    const current = students.find((s) => String(s.id) === String(studentId))
    studentService.deleteStudent(studentId)
    setStudents((prev) => prev.filter((s) => String(s.id) !== String(studentId)))
    addNotification('Siswa Dihapus', `Siswa dihapus: ${current?.name || studentId}`, 'info')
    showToast('Data siswa berhasil dihapus', 'success')
  }, [students, addNotification, showToast])

  return { students, addStudent, updateStudent, deleteStudent }
}
