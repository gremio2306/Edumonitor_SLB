import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HeartHandshake,
  History,
  MessageCircleMore,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleDashboardHeader from '../components/RoleDashboardHeader'
import { useApp } from '../context/AppContext'
import activityImage from '../assets/therapy-activity.png'

const weeklyProgress = [
  { day: 'Sen', value: 64 },
  { day: 'Sel', value: 72 },
  { day: 'Rab', value: 68 },
  { day: 'Kam', value: 81 },
  { day: 'Jum', value: 88 },
]

const monthlyProgress = [
  { day: 'M1', value: 58 },
  { day: 'M2', value: 66 },
  { day: 'M3', value: 72 },
  { day: 'M4', value: 84 },
  { day: 'M5', value: 88 },
]

export default function ChildMonitoringPage() {
  const navigate = useNavigate()
  const { students, reports, showToast } = useApp()

  const [period, setPeriod] = useState('weekly')
  const [searchQuery, setSearchQuery] = useState('')

  const child = students[0] || {
    id: '20240105',
    name: 'Budi Darmawan',
    className: 'Kelas 2-A',
    category: 'Autisme',
    initials: 'BD',
    progress: 75,
    tone: 'peach',
  }

  const childReports = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return reports
      .filter((report) => report.studentId === child.id)
      .filter((report) => {
        if (!keyword) return true

        return [
          report.category,
          report.note,
          report.author,
          report.status,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
  }, [child.id, reports, searchQuery])

  const chartData =
    period === 'weekly' ? weeklyProgress : monthlyProgress

  return (
    <div className="role-dashboard guardian-dashboard">
      <div className="role-dashboard-container">
        <RoleDashboardHeader
          breadcrumb="EduMonitor / Monitoring Anak"
          title="Monitoring Anak"
          description={`Pantau perkembangan harian ${child.name}.`}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari catatan perkembangan..."
        />

        <section className="guardian-child-hero">
          <div className="guardian-child-profile">
            <span
              className={`role-avatar extra-large ${child.tone}`}
            >
              {child.initials}
            </span>

            <div>
              <span className="role-eyebrow">
                Profil anak
              </span>

              <h2>{child.name}</h2>

              <p>
                {child.className} · {child.category}
              </p>

              <div className="guardian-child-tags">
                <span>
                  <CheckCircle2 size={14} />
                  Status BSH
                </span>

                <span>
                  <CalendarDays size={14} />
                  Kehadiran 98%
                </span>
              </div>
            </div>
          </div>

          <div className="guardian-child-status">
            <div>
              <span>Perkembangan semester</span>
              <strong>{child.progress}%</strong>
            </div>

            <div className="role-progress-track large">
              <i
                className="role-progress-fill purple"
                style={{ width: `${child.progress}%` }}
              />
            </div>

            <p>
              Berkembang sesuai harapan dan menunjukkan
              peningkatan konsisten.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(`/student/${child.id}`)
              }
            >
              Lihat profil lengkap
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="role-stat-grid">
          <article className="role-stat-card">
            <span className="role-stat-icon purple">
              <TrendingUp size={22} />
            </span>

            <div>
              <span>Progres Semester</span>
              <strong>{child.progress}%</strong>
              <small>Naik 8% bulan ini</small>
            </div>

            <span className="role-stat-delta positive">
              +8%
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon green">
              <CalendarDays size={22} />
            </span>

            <div>
              <span>Kehadiran</span>
              <strong>98%</strong>
              <small>20 dari 21 hari</small>
            </div>

            <span className="role-stat-delta positive">
              Baik
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon blue">
              <Sparkles size={22} />
            </span>

            <div>
              <span>Fokus Utama</span>
              <strong>Motorik</strong>
              <small>Koordinasi motorik halus</small>
            </div>

            <span className="role-stat-delta positive">
              Aktif
            </span>
          </article>

          <article className="role-stat-card">
            <span className="role-stat-icon orange">
              <FileText size={22} />
            </span>

            <div>
              <span>Catatan Guru</span>
              <strong>{Math.max(childReports.length, 3)}</strong>
              <small>Pembaruan minggu ini</small>
            </div>

            <span className="role-stat-delta">
              Baru
            </span>
          </article>
        </section>

        <section className="role-main-grid guardian-main-grid">
          <article className="role-panel guardian-progress-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Grafik perkembangan
                </span>
                <h2>Perkembangan Kemampuan</h2>
              </div>

              <div className="guardian-period-tabs">
                <button
                  type="button"
                  className={
                    period === 'weekly' ? 'active' : ''
                  }
                  onClick={() => setPeriod('weekly')}
                >
                  Mingguan
                </button>

                <button
                  type="button"
                  className={
                    period === 'monthly' ? 'active' : ''
                  }
                  onClick={() => setPeriod('monthly')}
                >
                  Bulanan
                </button>
              </div>
            </div>

            <div className="guardian-chart-summary">
              <div>
                <span>Indeks perkembangan</span>
                <strong>84</strong>
                <small>dari 100 poin</small>
              </div>

              <span>
                <TrendingUp size={16} />
                Meningkat 12% dari periode lalu
              </span>
            </div>

            <div className="guardian-progress-chart">
              {chartData.map((item) => (
                <div key={item.day}>
                  <div>
                    <i
                      style={{
                        height: `${item.value}%`,
                      }}
                    >
                      <span>{item.value}</span>
                    </i>
                  </div>

                  <small>{item.day}</small>
                </div>
              ))}
            </div>

            <div className="guardian-chart-legend">
              <span>
                <i className="purple" />
                Kemampuan motorik
              </span>

              <span>
                <i className="blue" />
                Target perkembangan
              </span>
            </div>
          </article>

          <aside className="role-panel guardian-schedule-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Agenda terdekat
                </span>
                <h2>Jadwal Anak</h2>
              </div>

              <CalendarDays size={21} />
            </div>

            <div className="guardian-schedule-list">
              <article>
                <time>
                  <strong>08:00</strong>
                  <span>Besok</span>
                </time>

                <span className="blue">
                  <BookOpenCheck size={19} />
                </span>

                <div>
                  <strong>Terapi Okupasi</strong>
                  <small>Ruang Inklusi 1</small>
                </div>
              </article>

              <article>
                <time>
                  <strong>10:30</strong>
                  <span>Jumat</span>
                </time>

                <span className="purple">
                  <MessageCircleMore size={19} />
                </span>

                <div>
                  <strong>Terapi Wicara</strong>
                  <small>Ruang Terapi 2</small>
                </div>
              </article>

              <article>
                <time>
                  <strong>09:00</strong>
                  <span>Senin</span>
                </time>

                <span className="orange">
                  <GraduationCap size={19} />
                </span>

                <div>
                  <strong>Asesmen Bulanan</strong>
                  <small>Kelas Inklusi A</small>
                </div>
              </article>
            </div>

            <button
              type="button"
              className="guardian-contact-button"
              onClick={() =>
                showToast(
                  'Permintaan menghubungi guru telah dikirim',
                  'success',
                )
              }
            >
              <HeartHandshake size={18} />
              Hubungi Guru Pendamping
            </button>
          </aside>
        </section>

        <section className="role-main-grid guardian-activity-grid">
          <article className="role-panel">
            <div className="role-panel-header">
              <div>
                <span className="role-panel-eyebrow">
                  Pembaruan guru
                </span>
                <h2>Catatan Terbaru</h2>
              </div>

              <button
                type="button"
                className="role-link-button"
                onClick={() => navigate('/history')}
              >
                Lihat riwayat
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="guardian-note-list">
              {childReports.length > 0 ? (
                childReports.slice(0, 3).map((report) => (
                  <article key={report.id}>
                    <span className="guardian-note-icon">
                      <MessageCircleMore size={19} />
                    </span>

                    <div>
                      <div>
                        <strong>{report.category}</strong>
                        <span>{report.status}</span>
                      </div>

                      <p>{report.note}</p>

                      <small>
                        Oleh {report.author} · {report.date}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="role-empty-state">
                  <MessageCircleMore size={30} />
                  <strong>Catatan tidak ditemukan</strong>
                  <span>Gunakan kata pencarian lain.</span>
                </div>
              )}
            </div>
          </article>

          <article className="guardian-photo-card">
            <img
              src={activityImage}
              alt="Aktivitas terapi dan perkembangan anak"
            />

            <div className="guardian-photo-overlay">
              <span className="role-eyebrow">
                Aktivitas terbaru
              </span>

              <h2>Latihan Koordinasi Motorik</h2>

              <p>
                Budi berhasil menyusun lima tingkat balok
                tanpa bantuan dan mempertahankan fokus
                selama sesi berlangsung.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/student/${child.id}`)
                }
              >
                Lihat detail aktivitas
                <ArrowRight size={16} />
              </button>
            </div>
          </article>
        </section>

        <section className="role-section">
          <div className="role-section-header">
            <div>
              <span className="role-panel-eyebrow">
                Akses orang tua
              </span>
              <h2>Informasi Anak</h2>
            </div>
          </div>

          <div className="role-quick-action-grid guardian-action-grid">
            <button
              type="button"
              className="role-quick-action"
              onClick={() => navigate('/history')}
            >
              <span className="role-quick-action-icon purple">
                <History size={22} />
              </span>

              <span>
                <strong>Riwayat Perkembangan</strong>
                <small>
                  Lihat catatan perkembangan terdahulu
                </small>
              </span>

              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="role-quick-action"
              onClick={() => navigate('/reports')}
            >
              <span className="role-quick-action-icon blue">
                <FileText size={22} />
              </span>

              <span>
                <strong>Laporan Lengkap</strong>
                <small>
                  Buka laporan mingguan dan bulanan
                </small>
              </span>

              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="role-quick-action"
              onClick={() =>
                navigate(`/student/${child.id}`)
              }
            >
              <span className="role-quick-action-icon green">
                <GraduationCap size={22} />
              </span>

              <span>
                <strong>Profil Anak</strong>
                <small>
                  Informasi lengkap dan target siswa
                </small>
              </span>

              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}