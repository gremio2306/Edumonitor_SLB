import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  const Icon = toast.type === 'error' ? TriangleAlert : toast.type === 'info' ? Info : CheckCircle2
  return <div className={`toast ${toast.type}`}><Icon size={20} /><span>{toast.message}</span></div>
}
