import { useCallback, useState } from 'react'
import * as teacherService from '../services/teacherService'

export function useTeachers(addNotification, showToast) {
  const [teachers, setTeachers] = useState(() => teacherService.getAllTeachers())

  const addTeacher = useCallback((teacher) => {
    const created = teacherService.createTeacher(teacher)
    setTeachers((prev) => [created, ...prev])
    addNotification('Guru Baru', `Guru baru ditambahkan: ${teacher.name}`, 'info')
    showToast('Guru baru berhasil ditambahkan', 'success')
    return created
  }, [addNotification, showToast])

  const updateTeacher = useCallback((teacherId, changes) => {
    teacherService.updateTeacher(teacherId, changes)
    setTeachers((prev) =>
      prev.map((t) =>
        String(t.id) === String(teacherId)
          ? { ...t, ...changes, id: t.id, initials: t.initials }
          : t,
      ),
    )
    showToast('Data guru berhasil diperbarui', 'success')
  }, [showToast])

  const deleteTeacher = useCallback((teacherId) => {
    teacherService.deleteTeacher(teacherId)
    setTeachers((prev) => prev.filter((t) => String(t.id) !== String(teacherId)))
    showToast('Data guru berhasil dihapus', 'success')
  }, [showToast])

  return { teachers, addTeacher, updateTeacher, deleteTeacher }
}
