import {
  BarChart3,
  Bell,
  Cctv,
  ClipboardList,
  FileBarChart2,
  GraduationCap,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCog,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const roleConfigurations = {
  teacher: {
    workspace: 'Teacher Workspace',
    roleLabel: 'Guru Kelas',
    icon: GraduationCap,
    homePath: '/home',
    mainMenu: [
      {
        label: 'Dashboard',
        path: '/home',
        icon: LayoutDashboard,
      },
      {
        label: 'Data Siswa',
        path: '/students',
        icon: GraduationCap,
        matches: ['/student/'],
      },
      {
        label: 'Monitoring',
        path: '/monitoring',
        icon: ClipboardList,
      },
      {
        label: 'Laporan',
        path: '/reports',
        icon: FileBarChart2,
      },
    ],
    secondaryMenu: [
      {
        label: 'Notifikasi',
        path: '/notifications',
        icon: Bell,
      },
      {
        label: 'Pengaturan',
        path: '/settings',
        icon: Settings,
      },
    ],
  },

  admin: {
    workspace: 'Admin Workspace',
    roleLabel: 'Administrator',
    icon: UserCog,
    homePath: '/home',
    mainMenu: [
      {
        label: 'Dashboard',
        path: '/home',
        icon: LayoutDashboard,
      },
      {
        label: 'Kelola Siswa',
        path: '/students',
        icon: GraduationCap,
        matches: ['/student/'],
      },
      {
        label: 'Kelola Guru',
        path: '/teachers',
        icon: UserCog,
      },
      {
        label: 'Laporan',
        path: '/reports',
        icon: BarChart3,
      },
    ],
    secondaryMenu: [
      {
        label: 'Wali Murid',
        path: '/guardians',
        icon: UsersRound,
      },
      {
        label: 'Notifikasi',
        path: '/notifications',
        icon: Bell,
      },
      {
        label: 'Pengaturan',
        path: '/settings',
        icon: Settings,
      },
    ],
  },

  guardian: {
    workspace: 'Parent Workspace',
    roleLabel: 'Wali Murid',
    icon: UsersRound,
    homePath: '/child-monitoring',
    mainMenu: [
      {
        label: 'Anak Saya',
        path: '/child-monitoring',
        icon: LayoutDashboard,
      },
      {
        label: 'Riwayat',
        path: '/history',
        icon: History,
      },
      {
        label: 'Laporan',
        path: '/reports',
        icon: FileBarChart2,
      },
      {
        label: 'Profil',
        path: '/profile',
        icon: UserRound,
      },
    ],
    secondaryMenu: [
      {
        label: 'Notifikasi',
        path: '/notifications',
        icon: Bell,
      },
      {
        label: 'Pengaturan',
        path: '/settings',
        icon: Settings,
      },
    ],
  },

  security: {
    workspace: 'Security Workspace',
    roleLabel: 'Petugas Keamanan',
    icon: ShieldCheck,
    homePath: '/security',
    mainMenu: [
      {
        label: 'Dashboard',
        path: '/security',
        icon: LayoutDashboard,
      },
      {
        label: 'Monitoring',
        path: '/monitoring',
        icon: Cctv,
      },
      {
        label: 'Laporan',
        path: '/reports',
        icon: FileBarChart2,
      },
      {
        label: 'Profil',
        path: '/profile',
        icon: UserRound,
      },
    ],
    secondaryMenu: [
      {
        label: 'Notifikasi',
        path: '/notifications',
        icon: Bell,
      },
      {
        label: 'Pengaturan',
        path: '/settings',
        icon: Settings,
      },
    ],
  },
}

function routeIsActive(item, pathname) {
  if (pathname === item.path) return true

  return item.matches?.some((prefix) =>
    pathname.startsWith(prefix),
  )
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const { auth } = useAuth()
  const { notifications } = useApp()

  const role = auth?.role || 'teacher'
  const configuration =
    roleConfigurations[role] || roleConfigurations.teacher

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length

  const RoleIcon = configuration.icon
  const userName = auth?.name || 'Pengguna EduMonitor'
  const initials = auth?.initials || 'EM'

  return (
    <>
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <RoleIcon size={24} />
          </div>

          <div>
            <strong>EduMonitor</strong>
            <span>{configuration.workspace}</span>
          </div>
        </div>

        <div className={`sidebar-role-chip ${role}`}>
          <RoleIcon size={15} />
          {configuration.roleLabel}
        </div>

        <div className="sidebar-label">Menu utama</div>

        <nav className="sidebar-menu">
          {configuration.mainMenu.map((item) => {
            const Icon = item.icon
            const active = routeIsActive(item, pathname)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  active
                    ? 'sidebar-link active'
                    : 'sidebar-link'
                }
              >
                <span className="sidebar-link-icon">
                  <Icon size={20} />
                </span>

                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-label">Sistem</div>

        <nav className="sidebar-menu sidebar-menu-secondary">
          {configuration.secondaryMenu.map((item) => {
            const Icon = item.icon
            const active = routeIsActive(item, pathname)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  active
                    ? 'sidebar-link active'
                    : 'sidebar-link'
                }
              >
                <span className="sidebar-link-icon">
                  <Icon size={20} />
                </span>

                <span>{item.label}</span>

                {item.path === '/notifications' &&
                  unreadCount > 0 && (
                    <span className="sidebar-notification-count">
                      {unreadCount}
                    </span>
                  )}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>

          <div className="sidebar-user-info">
            <strong>{userName}</strong>
            <span>{configuration.roleLabel}</span>
          </div>

          <Link
            to="/profile"
            className="sidebar-user-action"
            aria-label="Buka profil"
          >
            <UserRound size={18} />
          </Link>
        </div>
      </aside>

      <nav className="bottom-nav mobile-bottom-nav">
        {configuration.mainMenu.map((item) => {
          const Icon = item.icon
          const active = routeIsActive(item, pathname)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={active ? 'active' : ''}
            >
              <span className="nav-icon">
                <Icon size={21} />
              </span>

              <small>{item.label}</small>
            </Link>
          )
        })}
      </nav>
    </>
  )
}