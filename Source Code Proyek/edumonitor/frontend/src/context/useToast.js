import { useCallback, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  return { toast, showToast }
}
