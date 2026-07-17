import { Bell, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Avatar } from './UI'

export default function Header({ title = 'EduMonitor', subtitle, back = false, compact = false }) {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { notifications } = useApp()
  const unread = notifications.filter((n) => n.unread).length

  return (
    <header className={`app-header ${compact ? 'compact' : ''}`}>
      <div className="header-left">
        {back ? (
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="Kembali"><ChevronLeft /></button>
        ) : (
          <Avatar initials={auth?.initials || 'EM'} size={40} />
        )}
        <div>
          {subtitle && <small>{subtitle}</small>}
          <strong className="brand-title">{title}</strong>
        </div>
      </div>
      <button className="icon-button notification-button" onClick={() => navigate('/notifications')} aria-label="Notifikasi">
        <Bell size={21} />
        {unread > 0 && <span className="notification-dot">{unread}</span>}
      </button>
    </header>
  )
}
