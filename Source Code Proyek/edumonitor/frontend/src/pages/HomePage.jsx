import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminHome from './AdminHome'
import TeacherHome from './TeacherHome'

export default function HomePage() {
  const { auth } = useAuth()
  if (auth?.role === 'admin') return <AdminHome />
  if (auth?.role === 'security') return <Navigate to="/security" replace />
  if (auth?.role === 'guardian') return <Navigate to="/child-monitoring" replace />
  return <TeacherHome />
}
