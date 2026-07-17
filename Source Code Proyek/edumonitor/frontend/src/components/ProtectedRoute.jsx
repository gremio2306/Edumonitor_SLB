import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles }) {
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

  if (roles && !roles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
