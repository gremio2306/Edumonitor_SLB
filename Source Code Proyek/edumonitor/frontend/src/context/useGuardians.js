import { useCallback, useState } from 'react'
import * as guardianService from '../services/guardianService'

export function useGuardians(showToast) {
  const [guardians, setGuardians] = useState(() => guardianService.getAllGuardians())

  const addGuardian = useCallback((guardian) => {
    const created = guardianService.createGuardian(guardian)
    setGuardians((prev) => [created, ...prev])
    showToast('Wali murid berhasil ditambahkan', 'success')
    return created
  }, [showToast])

  const updateGuardian = useCallback((guardianId, changes) => {
    guardianService.updateGuardian(guardianId, changes)
    setGuardians((prev) =>
      prev.map((g) =>
        String(g.id) === String(guardianId)
          ? { ...g, ...changes, id: g.id, initials: g.initials }
          : g,
      ),
    )
    showToast('Data wali murid berhasil diperbarui', 'success')
  }, [showToast])

  const deleteGuardian = useCallback((guardianId) => {
    guardianService.deleteGuardian(guardianId)
    setGuardians((prev) => prev.filter((g) => String(g.id) !== String(guardianId)))
    showToast('Data wali murid berhasil dihapus', 'success')
  }, [showToast])

  return { guardians, addGuardian, updateGuardian, deleteGuardian }
}
