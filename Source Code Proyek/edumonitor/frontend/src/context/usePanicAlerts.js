import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../config/supabase'
import * as panicService from '../services/panicService'

export function usePanicAlerts(auth, showToast) {
  const [panicAlerts, setPanicAlerts] = useState([])
  const channelRef = useRef(null)

  useEffect(() => {
    panicService.getActivePanicAlerts().then(setPanicAlerts)

    const channel = panicService.subscribeToPanicAlerts(
      (newAlert) => {
        setPanicAlerts((prev) => [newAlert, ...prev])
      },
      (updatedAlert) => {
        setPanicAlerts((prev) =>
          prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)),
        )
      },
    )

    channelRef.current = channel

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  const addPanicAlert = useCallback(
    async (alert) => {
      try {
        const created = await panicService.createPanicAlert(alert)
        showToast('Panic alert berhasil dikirim!', 'success')
        return created
      } catch (err) {
        showToast('Gagal mengirim panic alert: ' + err.message, 'error')
        return null
      }
    },
    [showToast],
  )

  const resolvePanicAlert = useCallback(
    async (alertId) => {
      const updated = await panicService.updatePanicAlertStatus(alertId, 'resolved')
      if (updated) {
        setPanicAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updated : a)),
        )
        showToast('Panic alert telah ditangani', 'success')
      }
    },
    [showToast],
  )

  const respondPanicAlert = useCallback(
    async (alertId) => {
      const updated = await panicService.updatePanicAlertStatus(alertId, 'responding')
      if (updated) {
        setPanicAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updated : a)),
        )
        showToast('Status: menuju lokasi', 'success')
      }
    },
    [showToast],
  )

  return { panicAlerts, addPanicAlert, resolvePanicAlert, respondPanicAlert }
}
