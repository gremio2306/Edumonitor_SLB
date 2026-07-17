import { useCallback, useEffect, useState } from 'react'
import * as notificationService from '../services/notificationService'

export function useNotifications(auth) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!auth?.id) {
      setNotifications([])
      return
    }
    notificationService.getAllNotifications(auth.id).then(setNotifications)
  }, [auth?.id])

  const addNotification = useCallback(
    async (title, body, type = 'info') => {
      if (!auth?.id) return null
      const created = await notificationService.createNotification({
        user_id: auth.id,
        type,
        title,
        body,
      })
      if (created) {
        setNotifications((prev) => [created, ...prev])
      }
      return created
    },
    [auth?.id],
  )

  const markNotificationDone = useCallback(
    async (id) => {
      const updated = await notificationService.markAsRead(id)
      if (updated) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        )
      }
    },
    [],
  )

  return { notifications, addNotification, markNotificationDone }
}
