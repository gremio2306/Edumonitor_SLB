import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { historyItems as initialHistoryItems } from '../data/mockData'
import { useAuth } from './AuthContext'
import { useToast } from './useToast'
import { useNotifications } from './useNotifications'
import { useStudents } from './useStudents'
import { useTeachers } from './useTeachers'
import { useGuardians } from './useGuardians'
import { useReports } from './useReports'
import { usePanicAlerts } from './usePanicAlerts'
import { useSettings } from './useSettings'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { auth } = useAuth()
  const { toast, showToast } = useToast()
  const { notifications, addNotification, markNotificationDone } = useNotifications(auth)
  const { students, addStudent, updateStudent, deleteStudent } = useStudents(addNotification, showToast)
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useTeachers(addNotification, showToast)
  const { guardians, addGuardian, updateGuardian, deleteGuardian } = useGuardians(showToast)
  const { reports, addReport, updateReport, deleteReport } = useReports(addNotification, showToast)
  const { panicAlerts, addPanicAlert, resolvePanicAlert, respondPanicAlert } = usePanicAlerts(auth, showToast)
  const { settings, setSettings, toggleLanguage, toggleNotifications, togglePrivacy } = useSettings()
  const [historyItems] = useLocalStorage('edumonitor-history', initialHistoryItems)

  const value = useMemo(() => ({
    students, teachers, guardians, reports, notifications, panicAlerts, settings, toast, historyItems,
    addStudent, updateStudent, deleteStudent,
    addTeacher, updateTeacher, deleteTeacher,
    addGuardian, updateGuardian, deleteGuardian,
    addReport, updateReport, deleteReport,
    addNotification, markNotificationDone,
    addPanicAlert, resolvePanicAlert, respondPanicAlert,
    setSettings, toggleLanguage, toggleNotifications, togglePrivacy, showToast,
  }), [
    students, teachers, guardians, reports, notifications, panicAlerts, settings, toast, historyItems,
    addStudent, updateStudent, deleteStudent,
    addTeacher, updateTeacher, deleteTeacher,
    addGuardian, updateGuardian, deleteGuardian,
    addReport, updateReport, deleteReport,
    addNotification, markNotificationDone,
    addPanicAlert, resolvePanicAlert, respondPanicAlert,
    setSettings, toggleLanguage, toggleNotifications, togglePrivacy, showToast,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp harus digunakan di dalam AppProvider')
  return value
}
