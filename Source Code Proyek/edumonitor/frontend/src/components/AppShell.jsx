import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'
import Toast from './Toast'

const noBottomNav = [
  '/login',
  '/emergency',
  '/progress/new',
  '/assessment',
  '/journal',
]

export default function AppShell() {
  const { auth } = useAuth()
  const location = useLocation()

  if (!auth) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  const hideNav = noBottomNav.includes(location.pathname)

  return (
    <div
      className={
        hideNav
          ? 'phone-shell shell-without-nav'
          : 'phone-shell shell-with-nav'
      }
    >
      {!hideNav && <BottomNav />}

      <main
        className={
          hideNav
            ? 'app-main no-bottom-nav'
            : 'app-main'
        }
      >
        <Outlet />
      </main>

      <Toast />
    </div>
  )
}
