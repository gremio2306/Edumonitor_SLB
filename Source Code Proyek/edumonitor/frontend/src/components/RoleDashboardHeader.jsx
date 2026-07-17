import { Bell, CalendarDays, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

function getInitials(name) {
  return String(name || 'EM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function RoleDashboardHeader({
  breadcrumb,
  title,
  description,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Cari data...',
}) {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { notifications } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => window.clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length

  const userName = auth?.name || 'Pengguna EduMonitor'
  const userTitle = auth?.title || 'Pengguna'
  const initials = auth?.initials || getInitials(userName)

  const dateText = currentDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const timeText = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="role-web-header">
      <div className="role-header-copy">
        <span className="role-breadcrumb">{breadcrumb}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="role-header-actions">
        {typeof onSearchChange === 'function' && (
          <label className="role-search">
            <Search size={18} />

            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>
        )}

        <div className="role-date-card">
          <CalendarDays size={18} />

          <div>
            <strong>{timeText}</strong>
            <span>{dateText}</span>
          </div>
        </div>

        <button
          type="button"
          className="role-header-icon"
          onClick={() => navigate('/notifications')}
          aria-label="Buka notifikasi"
        >
          <Bell size={20} />

          {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>

        <button
          type="button"
          className="role-profile-button"
          onClick={() => navigate('/profile')}
        >
          <span>{initials}</span>

          <div>
            <strong>{userName}</strong>
            <small>{userTitle}</small>
          </div>
        </button>
      </div>
    </header>
  )
}
