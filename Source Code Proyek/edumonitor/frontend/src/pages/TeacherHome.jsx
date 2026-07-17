import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  GraduationCap,
  MessageSquareText,
  Plus,
  Siren,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleDashboardHeader from '../components/RoleDashboardHeader'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const agendaItems = [
  {
    id: 1,
    time: '08:00',
    endTime: '09:30',
    title: 'Sesi Terapi Okupasi',
    location: 'Ruang Inklusi 1',
    category: 'Terapi',
    tone: 'blue',
    icon: BookOpenCheck,
    path: '/monitoring',
  },
  {
    id: 2,
    time: '10:45',
    endTime: '11:30',
    title: 'Asesmen Mingguan: Budi',
    location: 'Kelas Inklusi A',
    category: 'Penting',
    tone: 'purple',
    icon: ClipboardCheck,
    path: '/assessment',
  },
  {
    id: 3,
    time: '13:00',
    endTime: '13:45',
    title: 'Evaluasi Kemampuan Komunikasi',
    location: 'Ruang Terapi Wicara',
    category: 'Evaluasi',
    tone: 'green',
    icon: MessageSquareText,
    path: '/progress/new',
  },
]

const quickActions = [
  {
    title: 'Input Perkembangan',
    description: 'Catat kemajuan harian siswa',
    icon: Plus,
    path: '/progress/new',
    tone: 'blue',
  },
  {
    title: 'Input Penilaian',
    description: 'Tambahkan hasil asesmen siswa',
    icon: ClipboardCheck,
    path: '/assessment',
    tone: 'purple',
  },
  {
    title: 'Jurnal Harian',
    description: 'Tuliskan aktivitas dan kejadian',
    icon: CalendarClock,
    path: '/journal',
    tone: 'orange',
  },
  {
    title: 'Laporan Kelas',
    description: 'Lihat laporan perkembangan',
    icon: FilePlus2,
    path: '/reports',
    tone: 'green',
  },
]

export default function TeacherHome() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { students, reports, notifications } = useApp()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStudents = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    if (!keyword) return students.slice(0, 5)

    return students
      .filter((student) =>
        [
          student.name,
          student.className,
          student.category,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword),
      )
      .slice(0, 5)
  }, [searchQuery, students])

  const needsAttention = students
    .filter((student) => student.progress < 70)
    .slice(0, 3)

  const averageProgress = Math.round(
    students.reduce(
      (total, student) => total + student.progress,
      0,
    ) / Math.max(students.length, 1),
  )

  const attendanceRate = students.length
    ? Math.round(
        (students.filter((s) => s.progress >= 50).length /
          students.length) *
          100,
      )
    : 0

  const presentCount = students.filter(
    (s) => s.progress > 0,
  ).length

  const targetReached = students.filter(
    (s) => s.progress >= 80,
  ).length

  return (
    <div className="role-dashboard teacher-dashboard">
      <div className="role-dashboard-container">
        <RoleDashboardHeader
          breadcrumb="EduMonitor / Dashboard Guru"
          title="Dashboard Guru"
          description="Pantau agenda, perkembangan siswa, dan aktivitas kelas."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama siswa..."
        />

        <section className="role-hero teacher-hero">
          <div className="role-hero-copy">
            <span className="role-eyebrow">
              Kelas Inklusi A
            </span>

            <h2>
              Selamat pagi, {auth?.name || 'Bu Maria'}!
            </h2>

            <p>
              Terdapat tiga agenda pembelajaran dan satu
              siswa yang perlu mendapat perhatian hari ini.
            </p>

            <div className="role-hero-actions">
              <button
                type="button"
                className="role-button primary"
                onClick={() => navigate('/progress/new')}
              >
                <Plus size={18} />
                Input Perkembangan
              </button>

              <button
                type="button"
                className="role-button secondary"
                onClick={() => navigate('/students')}
              >
                <UsersRound size={18} />
                Lihat Semua Siswa
              </button>
            </div>
          </div>

          <div className="teacher-hero-summary">
            <div className="teacher-summary-circle">
              <strong>{averageProgress}%</strong>
              <span>Rata-rata progres</span>
            </div>

            <div className="teacher-summary-list">
              <div>
                <span>
                  <CheckCircle2 size={16} />
                  Kehadiran
                </span>
                <strong>{attendanceRate}%</strong>
              </div>

              <div>
                <span>
                  <ClipboardCheck size={16} />
                  Laporan hari ini
                </span>
                <strong>{reports.length}</strong>
              </div>

              <div>
                <span>
                  <Sparkles size={16} />
                  Target tercapai
                </span>
                <strong>{targetReached}</strong>
              </div>
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
              <strong>{students.length}</strong>
              <small>Siswa dalam pendampingan</small>
            </div>

            <span className="role-stat-delta positive">
              Aktif
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon green">
              <CheckCircle2 size={22} />
            </span>

            <div>
              <span>Kehadiran Hari Ini</span>
              <strong>{attendanceRate}%</strong>
              <small>{presentCount} dari {students.length} siswa hadir</small>
            </div>

            <span className="role-stat-delta positive">
              Aktif
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon purple">
              <TrendingUp size={22} />
            </span>

            <div>
              <span>Rata-rata Perkembangan</span>
              <strong>{averageProgress}%</strong>
              <small>Perkembangan semester</small>
            </div>

            <span className="role-stat-delta positive">
              {reports.length > 0 ? `+${Math.min(reports.length, 20)}%` : '-'}
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon orange">
              <AlertTriangle size={22} />
            </span>

            <div>
              <span>Perlu Perhatian</span>
              <strong>{needsAttention.length}</strong>
              <small>Siswa di bawah target</small>
            </div>

            <span className="role-stat-delta warning">
              Tinjau
            </span>
          </article>
        </section>

        <section className="role-main-grid teacher-main-grid">
          <article className="role-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Jadwal pembelajaran
                </span>
                <h2>Agenda Hari Ini</h2>
              </div>

              <button
                type="button"
                className="role-link-button"
                onClick={() => navigate('/monitoring')}
              >
                Lihat semua
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="teacher-agenda-list">
              {agendaItems.map((agenda, index) => {
                const Icon = agenda.icon

                return (
                  <button
                    key={agenda.id}
                    type="button"
                    className="teacher-agenda-item"
                    onClick={() => navigate(agenda.path)}
                  >
                    <div className="teacher-agenda-time">
                      <strong>{agenda.time}</strong>
                      <span>{agenda.endTime}</span>
                    </div>

                    <span
                      className={`teacher-agenda-line ${agenda.tone}`}
                    >
                      <i />
                    </span>

                    <span
                      className={`teacher-agenda-icon ${agenda.tone}`}
                    >
                      <Icon size={20} />
                    </span>

                    <div className="teacher-agenda-copy">
                      <strong>{agenda.title}</strong>

                      <span>
                        {agenda.location} · {agenda.category}
                      </span>
                    </div>

                    {index === 1 && (
                      <span className="teacher-agenda-badge">
                        Penting
                      </span>
                    )}

                    <ArrowRight
                      className="teacher-agenda-arrow"
                      size={17}
                    />
                  </button>
                )
              })}
            </div>
          </article>

          <aside className="role-panel teacher-attention-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Prioritas guru
                </span>
                <h2>Perlu Perhatian</h2>
              </div>

              <span className="role-count-badge">
                {needsAttention.length}
              </span>
            </div>

            <div className="teacher-attention-list">
              {needsAttention.length > 0 ? (
                needsAttention.map((student) => (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() =>
                      navigate(`/student/${student.id}`)
                    }
                  >
                    <span
                      className={`role-avatar ${student.tone}`}
                    >
                      {student.initials}
                    </span>

                    <div>
                      <strong>{student.name}</strong>
                      <span>
                        {student.category} · {student.className}
                      </span>

                      <div className="role-progress-track">
                        <i
                          className="role-progress-fill orange"
                          style={{
                            width: `${student.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <b>{student.progress}%</b>
                  </button>
                ))
              ) : (
                <div className="role-empty-state">
                  <CheckCircle2 size={30} />
                  <strong>Semua siswa sesuai target</strong>
                  <span>Tidak ada perhatian khusus.</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="teacher-emergency-button"
              onClick={() => navigate('/emergency')}
            >
              <Siren size={19} />

              <span>
                <strong>Keadaan Darurat</strong>
                <small>
                  Aktifkan protokol bantuan kelas
                </small>
              </span>

              <ArrowRight size={17} />
            </button>
          </aside>
        </section>

        <section className="role-section">
          <div className="role-section-header">
            <div>
              <span className="role-panel-eyebrow">
                Perkembangan terbaru
              </span>
              <h2>Progres Siswa</h2>
            </div>

            <button
              type="button"
              className="role-link-button"
              onClick={() => navigate('/students')}
            >
              Semua siswa
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="teacher-student-grid">
            {filteredStudents.map((student) => (
              <button
                type="button"
                className="teacher-student-card"
                key={student.id}
                onClick={() =>
                  navigate(`/student/${student.id}`)
                }
              >
                <div className="teacher-student-head">
                  <span
                    className={`role-avatar large ${student.tone}`}
                  >
                    {student.initials}
                  </span>

                  <div>
                    <strong>{student.name}</strong>
                    <span>
                      {student.className} · {student.category}
                    </span>
                  </div>

                  <ArrowRight size={17} />
                </div>

                <div className="teacher-student-progress">
                  <span>
                    Target perkembangan
                    <b>{student.progress}%</b>
                  </span>

                  <div className="role-progress-track">
                    <i
                      className={
                        student.progress < 60
                          ? 'role-progress-fill orange'
                          : 'role-progress-fill purple'
                      }
                      style={{
                        width: `${student.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="role-section">
          <div className="role-section-header">
            <div>
              <span className="role-panel-eyebrow">
                Akses cepat
              </span>
              <h2>Aktivitas Guru</h2>
            </div>
          </div>

          <div className="role-quick-action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  type="button"
                  key={action.title}
                  className="role-quick-action"
                  onClick={() => navigate(action.path)}
                >
                  <span
                    className={`role-quick-action-icon ${action.tone}`}
                  >
                    <Icon size={22} />
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
      </div>
    </div>
  )
}