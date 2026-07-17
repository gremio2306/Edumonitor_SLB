import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import AssessmentPage from './pages/AssessmentPage'
import ChildMonitoringPage from './pages/ChildMonitoringPage'
import EmergencyPage from './pages/EmergencyPage'
import GuardiansPage from './pages/GuardiansPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import JournalPage from './pages/JournalPage'
import LoginPage from './pages/LoginPage'
import MonitoringPage from './pages/MonitoringPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import ProgressFormPage from './pages/ProgressFormPage'
import RegisterPage from './pages/RegisterPage'
import ReportsPage from './pages/ReportsPage'
import SecurityHome from './pages/SecurityHome'
import SettingsPage from './pages/SettingsPage'
import StudentDetailPage from './pages/StudentDetailPage'
import StudentsPage from './pages/StudentsPage'
import TeachersPage from './pages/TeachersPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/guardians" element={<GuardiansPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/progress/new" element={<ProgressFormPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/student/:id" element={<StudentDetailPage />} />
          <Route path="/child-monitoring" element={<ChildMonitoringPage />} />
          <Route path="/security" element={<SecurityHome />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
