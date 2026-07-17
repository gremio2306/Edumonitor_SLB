import { useCallback, useState } from 'react'
import * as reportService from '../services/reportService'

export function useReports(addNotification, showToast) {
  const [reports, setReports] = useState(() => reportService.getAllReports())

  const addReport = useCallback((report) => {
    const created = reportService.createReport(report)
    setReports((prev) => [created, ...prev])
    const isAssessment = report.category?.startsWith('Penilaian')
    const isJournal = report.category === 'Jurnal Harian'
    if (isAssessment) {
      addNotification('Penilaian Baru', `Penilaian untuk ${report.student}: ${report.category}`, 'progress')
    } else if (!isJournal) {
      addNotification('Perkembangan Baru', `Perkembangan baru untuk ${report.student}`, 'progress')
    }
    showToast('Laporan berhasil disimpan')
  }, [addNotification, showToast])

  const updateReport = useCallback((reportId, changes) => {
    reportService.updateReport(reportId, changes)
    setReports((prev) =>
      prev.map((r) => (String(r.id) === String(reportId) ? { ...r, ...changes, id: r.id } : r)),
    )
    showToast('Laporan berhasil diperbarui', 'success')
  }, [showToast])

  const deleteReport = useCallback((reportId) => {
    reportService.deleteReport(reportId)
    setReports((prev) => prev.filter((r) => String(r.id) !== String(reportId)))
    showToast('Laporan berhasil dihapus', 'success')
  }, [showToast])

  return { reports, addReport, updateReport, deleteReport }
}
