import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileBarChart2,
  GraduationCap,
  Settings2,
  TrendingUp,
  UserCog,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleDashboardHeader from '../components/RoleDashboardHeader'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const monthlyGrowth = [
  { month: 'Jan', value: 58 },
  { month: 'Feb', value: 66 },
  { month: 'Mar', value: 61 },
  { month: 'Apr', value: 75 },
  { month: 'Mei', value: 82 },
  { month: 'Jun', value: 91 },
]

const managementActions = [
  {
    title: 'Kelola Siswa',
    description: 'Tambah dan perbarui data siswa',
    path: '/students',
    icon: GraduationCap,
    tone: 'blue',
  },
  {
    title: 'Kelola Guru',
    description: 'Atur tenaga pendidik sekolah',
    path: '/teachers',
    icon: UserCog,
    tone: 'purple',
  },
  {
    title: 'Wali Murid',
    description: 'Kelola kontak keluarga siswa',
    path: '/guardians',
    icon: UsersRound,
    tone: 'orange',
  },
  {
    title: 'Laporan',
    description: 'Tinjau laporan perkembangan',
    path: '/reports',
    icon: FileBarChart2,
    tone: 'green',
  },
  {
    title: 'Pengaturan',
    description: 'Atur sistem dan preferensi',
    path: '/settings',
    icon: Settings2,
    tone: 'gray',
  },
]

export default function AdminHome() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { students, teachers, guardians, reports, notifications } = useApp()
  const [searchQuery, setSearchQuery] = useState('')

  const activities = useMemo(() =>
    notifications.slice(0, 5).map((n) => ({
      id: n.id,
      title: n.title,
      description: n.body,
      time: n.time,
      tone: n.type === 'danger' ? 'orange' : n.type === 'progress' ? 'green' : n.type === 'info' ? 'blue' : 'purple',
      icon: n.type === 'danger' ? AlertTriangle : n.type === 'progress' ? TrendingUp : n.type === 'info' ? GraduationCap : ClipboardList,
    })),
  [notifications])

  const filteredActivities = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    if (!keyword) return activities

    return activities.filter((activity) =>
      [
        activity.title,
        activity.description,
        activity.time,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [searchQuery, activities])

  const totalStudents = students.length
  const totalTeachers = teachers.length
  const totalGuardians = guardians.length

  const categorySummary = useMemo(() => {
    const total = students.length || 1
    const cats = ['Autisme', 'ADHD', 'Disleksia', 'Umum']
    const tones = { Autisme: 'purple', ADHD: 'blue', Disleksia: 'orange', Umum: 'green' }
    return cats.map((label) => ({
      label,
      value: students.filter((s) => s.category === label).length,
      percentage: Math.round((students.filter((s) => s.category === label).length / total) * 100),
      tone: tones[label],
    }))
  }, [students])

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  )

  return (
    <div className="role-dashboard admin-dashboard">
      <div className="role-dashboard-container">
        <RoleDashboardHeader
          breadcrumb="EduMonitor / Dashboard Admin"
          title="Dashboard Admin"
          description="Kelola data sekolah dan pantau aktivitas sistem."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari aktivitas sistem..."
        />

        <section className="role-hero admin-hero">
          <div className="role-hero-copy">
            <span className="role-eyebrow">
              Ringkasan sekolah
            </span>

            <h2>
              Selamat datang, {auth?.name || 'Sarah'}!
            </h2>

            <p>
              Data sekolah hari ini berada dalam kondisi
              stabil. Terdapat tiga laporan baru yang perlu
              ditinjau.
            </p>

            <div className="role-hero-actions">
              <button
                type="button"
                className="role-button primary"
                onClick={() => navigate('/students')}
              >
                <GraduationCap size={18} />
                Kelola Data Siswa
              </button>

              <button
                type="button"
                className="role-button secondary"
                onClick={() => navigate('/reports')}
              >
                <BarChart3 size={18} />
                Buka Laporan
              </button>
            </div>
          </div>

          <div className="admin-hero-summary">
            <span className="admin-hero-icon">
              <TrendingUp size={28} />
            </span>

            <div>
              <span>Pertumbuhan data semester ini</span>
              <strong>+12.8%</strong>
              <small>
                16 siswa dan 3 tenaga pendidik baru
              </small>
            </div>

            <div className="admin-mini-chart">
              {[38, 46, 43, 61, 67, 82, 90].map(
                (value, index) => (
                  <i
                    key={index}
                    style={{ height: `${value}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </section>

        <section className="role-stat-grid">
          <article className="role-stat-card">
            <span className="role-stat-icon blue">
              <GraduationCap size={22} />
            </span>

            <div>
              <span>Total Siswa</span>
              <strong>{totalStudents}</strong>
              <small>12 siswa baru bulan ini</small>
            </div>

            <span className="role-stat-delta positive">
              +10.7%
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon purple">
              <UserCog size={22} />
            </span>

            <div>
              <span>Tenaga Pendidik</span>
              <strong>{totalTeachers}</strong>
              <small>18 guru aktif hari ini</small>
            </div>

            <span className="role-stat-delta positive">
              Aktif
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon orange">
              <UsersRound size={22} />
            </span>

            <div>
              <span>Wali Murid</span>
              <strong>{totalGuardians}</strong>
              <small>Kontak keluarga terdaftar</small>
            </div>

            <span className="role-stat-delta positive">
              96%
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon green">
              <FileBarChart2 size={22} />
            </span>

            <div>
              <span>Total Laporan</span>
              <strong>{reports.length}</strong>
              <small>3 laporan belum ditinjau</small>
            </div>

            <span className="role-stat-delta warning">
              Tinjau
            </span>
          </article>
        </section>

        <section className="role-main-grid admin-main-grid">
          <article className="role-panel admin-growth-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Analitik sekolah
                </span>
                <h2>Pertumbuhan Data Siswa</h2>
              </div>

              <select defaultValue="semester">
                <option value="semester">
                  Semester ini
                </option>
                <option value="year">Tahun ini</option>
              </select>
            </div>

            <div className="admin-chart-summary">
              <div>
                <span>Total pendaftaran</span>
                <strong>124 siswa</strong>
              </div>

              <span className="admin-growth-label">
                <TrendingUp size={15} />
                12.8% dibanding periode lalu
              </span>
            </div>

            <div className="admin-growth-chart">
              {monthlyGrowth.map((item) => (
                <div
                  className="admin-chart-column"
                  key={item.month}
                >
                  <div className="admin-chart-track">
                    <i
                      style={{
                        height: `${item.value}%`,
                      }}
                    >
                      <span>{item.value}</span>
                    </i>
                  </div>

                  <small>{item.month}</small>
                </div>
              ))}
            </div>
          </article>

          <aside className="role-panel admin-distribution-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Data siswa
                </span>
                <h2>Kategori Pendampingan</h2>
              </div>

              <button
                type="button"
                className="role-link-button"
                onClick={() => navigate('/students')}
              >
                Detail
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="admin-distribution-list">
              {categorySummary.map((category) => (
                <div key={category.label}>
                  <div>
                    <span
                      className={`admin-category-dot ${category.tone}`}
                    />
                    <strong>{category.label}</strong>
                    <small>{category.value} siswa</small>
                    <b>{category.percentage}%</b>
                  </div>

                  <div className="role-progress-track">
                    <i
                      className={`role-progress-fill ${category.tone}`}
                      style={{
                        width: `${category.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="role-section">
          <div className="role-section-header">
            <div>
              <span className="role-panel-eyebrow">
                Manajemen data
              </span>
              <h2>Akses Cepat Admin</h2>
            </div>
          </div>

          <div className="admin-management-grid">
            {managementActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  key={action.title}
                  type="button"
                  className="admin-management-card"
                  onClick={() => navigate(action.path)}
                >
                  <span
                    className={`role-quick-action-icon ${action.tone}`}
                  >
                    <Icon size={23} />
                  </span>

                  <span>
                    <strong>{action.title}</strong>
                    <small>{action.description}</small>
                  </span>

                  <ArrowRight size={17} />
                </button>
              )
            })}
          </div>
        </section>

        <section className="role-main-grid admin-bottom-grid">
          <article className="role-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Sistem EduMonitor
                </span>
                <h2>Aktivitas Terbaru</h2>
              </div>

              <button
                type="button"
                className="role-link-button"
                onClick={() => navigate('/notifications')}
              >
                Lihat semua
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="admin-activity-list">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => {
                  const Icon = activity.icon

                  return (
                    <article key={activity.id}>
                      <span
                        className={`admin-activity-icon ${activity.tone}`}
                      >
                        <Icon size={19} />
                      </span>

                      <div>
                        <strong>{activity.title}</strong>
                        <span>{activity.description}</span>
                      </div>

                      <time>{activity.time}</time>
                    </article>
                  )
                })
              ) : (
                <div className="role-empty-state">
                  <Activity size={30} />
                  <strong>Aktivitas tidak ditemukan</strong>
                  <span>Gunakan kata pencarian lain.</span>
                </div>
              )}
            </div>
          </article>

          <aside className="role-panel admin-review-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Membutuhkan tindakan
                </span>
                <h2>Perlu Ditinjau</h2>
              </div>

              <span className="role-count-badge warning">
                {unreadCount}
              </span>
            </div>

            <div className="admin-review-list">
              <button
                type="button"
                onClick={() => navigate('/reports')}
              >
                <span className="orange">
                  <AlertTriangle size={18} />
                </span>

                <div>
                  <strong>Laporan bulanan Mei</strong>
                  <small>Belum mendapat persetujuan</small>
                </div>

                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/students')}
              >
                <span className="blue">
                  <GraduationCap size={18} />
                </span>

                <div>
                  <strong>2 data siswa belum lengkap</strong>
                  <small>Dokumen perlu diverifikasi</small>
                </div>

                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/teachers')}
              >
                <span className="purple">
                  <UserCog size={18} />
                </span>

                <div>
                  <strong>Jadwal guru belum diatur</strong>
                  <small>1 tenaga pendidik baru</small>
                </div>

                <ArrowRight size={16} />
              </button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}