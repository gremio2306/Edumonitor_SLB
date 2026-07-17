import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Cctv,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  Maximize2,
  MessageSquareText,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Siren,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const cameraFeeds = [
  {
    id: 1,
    name: 'Gerbang Utama',
    location: 'Area depan sekolah',
    status: 'Online',
    image:
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    name: 'Taman Bermain',
    location: 'Area aktivitas siswa',
    status: 'Online',
    image:
      'https://images.unsplash.com/photo-1596997000103-e597b3ca50df?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 3,
    name: 'Koridor Selatan',
    location: 'Gedung utama lantai 1',
    status: 'Online',
    image:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80',
  },
]

function getUserName(auth) {
  if (!auth || typeof auth !== 'object') {
    return 'Petugas Keamanan'
  }

  return (
    auth.name ||
    auth.fullName ||
    auth.user?.name ||
    'Petugas Keamanan'
  )
}

function getInitials(name) {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join('')
}

export default function SecurityHome() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { notifications, panicAlerts, resolvePanicAlert, respondPanicAlert } = useApp()

  const userName = getUserName(auth)
  const initials = getInitials(userName)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [visitorCount, setVisitorCount] = useState(18)
  const [showVisitorModal, setShowVisitorModal] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [globalQuery, setGlobalQuery] = useState('')
  const [reportQuery, setReportQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const [visitorForm, setVisitorForm] = useState({ name: '', purpose: '' })

  useEffect(() => {
    if (panicAlerts.length > 0) setLoading(false)
    const timer = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(timer)
  }, [panicAlerts])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)
    return () => window.clearInterval(interval)
  }, [])

  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
  }, [currentDate])

  const formattedTime = useMemo(() => {
    return currentDate.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit',
    })
  }, [currentDate])

  const activePanicCount = useMemo(
    () => panicAlerts.filter((a) => a.status === 'pending' || a.status === 'Perlu tindakan').length,
    [panicAlerts],
  )

  const hasActivePanic = activePanicCount > 0

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.is_read === false).length,
    [notifications],
  )

  const filteredAlerts = useMemo(() => {
    const keyword = reportQuery.trim().toLowerCase()
    if (!keyword) return panicAlerts
    return panicAlerts.filter((item) =>
      [item.student_name, item.location, item.location_name, item.triggered_by_name, item.status, item.class_name]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [panicAlerts, reportQuery])

  function handleAddVisitor(event) {
    event.preventDefault()
    if (!visitorForm.name.trim() || !visitorForm.purpose.trim()) return
    setVisitorCount((count) => count + 1)
    setVisitorForm({ name: '', purpose: '' })
    setShowVisitorModal(false)
  }

  function scrollToCamera() {
    document.getElementById('camera-section')?.scrollIntoView({
      behavior: 'smooth', block: 'start',
    })
  }

  function formatAlertTime(createdAt) {
    if (!createdAt) return '-'
    const d = new Date(createdAt)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  function statusLabel(status) {
    if (status === 'pending') return 'Pending'
    if (status === 'Perlu tindakan') return 'Pending'
    if (status === 'responding') return 'Menuju Lokasi'
    if (status === 'resolved') return 'Selesai'
    if (status === 'Selesai') return 'Selesai'
    return status || '-'
  }

  function statusClass(status) {
    if (status === 'resolved' || status === 'Selesai') return 'success'
    if (status === 'responding') return 'warning'
    return 'danger'
  }

  return (
    <div className="security-dashboard">
      <div className="security-dashboard-container">
        <header className="security-web-header">
          <div className="security-header-title">
            <span className="security-breadcrumb">
              EduMonitor / Dashboard Keamanan
            </span>

            <h1>Dashboard Keamanan</h1>

            <p>
              Pantau keamanan, pengunjung, kamera, dan
              laporan sekolah secara real-time.
            </p>
          </div>

          <div className="security-header-actions">
            <label className="security-global-search">
              <Search size={19} />

              <input
                type="search"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="Cari laporan atau lokasi..."
              />
            </label>

            <div className="security-header-time">
              <Clock3 size={18} />

              <div>
                <strong>{formattedTime}</strong>
                <span>{formattedDate}</span>
              </div>
            </div>

            <button
              type="button"
              className="security-header-icon"
              onClick={() =>
                navigate('/notifications')
              }
              aria-label="Buka notifikasi"
            >
              <Bell size={21} />

              <span>{unreadCount + activePanicCount}</span>
            </button>

            <button
              type="button"
              className="security-profile-button"
              onClick={() => navigate('/profile')}
            >
              <span>{initials}</span>

              <div>
                <strong>{userName}</strong>
                <small>Petugas Keamanan</small>
              </div>
            </button>
          </div>
        </header>

        <section className="security-overview-grid">
          <article className={`school-status-panel${hasActivePanic ? ' danger' : ''}`}>
            <div className="school-status-content">
              <div className="status-icon-wrapper">
                {hasActivePanic ? (
                  <Siren size={35} strokeWidth={2} />
                ) : (
                  <ShieldCheck size={35} strokeWidth={2} />
                )}
              </div>

              <div>
                <span className="panel-eyebrow">
                  Status sekolah saat ini
                </span>

                <h2>{hasActivePanic ? 'PERINGATAN DARURAT' : 'Seluruh Area Aman'}</h2>

                <p>
                  {hasActivePanic
                    ? `${activePanicCount} panic alert aktif! Guru telah mengirimkan sinyal darurat.`
                    : 'Sistem keamanan aktif dan semua area sekolah berada dalam pemantauan normal.'}
                </p>

                <div className="school-status-meta">
                  {hasActivePanic ? (
                    <span className="status-pill danger">
                      <span />
                      {activePanicCount} Panic Alert Aktif
                    </span>
                  ) : (
                    <span className="status-pill success">
                      <span />
                      Terkendali
                    </span>
                  )}

                  <span className="status-pill neutral">
                    Terakhir diperbarui {formattedTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="school-status-actions">
              <button
                type="button"
                className="status-secondary-button"
                onClick={scrollToCamera}
              >
                <Cctv size={18} />
                Lihat Kamera
              </button>

              <button
                type="button"
                className="status-primary-button"
                onClick={() =>
                  navigate('/emergency')
                }
              >
                <Siren size={18} />
                Protokol Darurat
              </button>
            </div>
          </article>

          <div className="security-stat-grid">
            <article className="security-stat-card">
              <div className="security-stat-icon blue">
                <Cctv size={22} />
              </div>

              <div>
                <span>CCTV Aktif</span>
                <strong>12/12</strong>
                <small>Semua kamera online</small>
              </div>

              <span className="security-stat-trend positive">
                100%
              </span>
            </article>

            <article className="security-stat-card">
              <div className="security-stat-icon purple">
                <Users size={22} />
              </div>

              <div>
                <span>Pengunjung Hari Ini</span>
                <strong>{visitorCount}</strong>
                <small>3 masih di area sekolah</small>
              </div>

              <span className="security-stat-trend">
                +4
              </span>
            </article>

            <article className="security-stat-card">
              <div className="security-stat-icon orange">
                <AlertTriangle size={22} />
              </div>

              <div>
                <span>Panic Aktif</span>
                <strong>{activePanicCount}</strong>
                <small>{activePanicCount > 0 ? 'Memerlukan respons segera' : 'Tidak ada panic alert'}</small>
              </div>

              <span
                className={
                  activePanicCount > 0
                    ? 'security-stat-trend warning'
                    : 'security-stat-trend positive'
                }
              >
                {activePanicCount > 0
                  ? `${activePanicCount} Aktif`
                  : 'Aman'}
              </span>
            </article>

            <article className="security-stat-card">
              <div className="security-stat-icon green">
                <Building2 size={22} />
              </div>

              <div>
                <span>Area Aman</span>
                <strong>8/8</strong>
                <small>Seluruh zona terkendali</small>
              </div>

              <span className="security-stat-trend positive">
                Stabil
              </span>
            </article>
          </div>
        </section>

        <section className="security-section">
          <div className="security-section-header">
            <div>
              <span className="panel-eyebrow">
                Akses cepat
              </span>

              <h2>Tindakan Keamanan</h2>
            </div>
          </div>

          <div className="security-quick-actions">
            <button
              type="button"
              className="quick-action-card emergency"
              onClick={() => navigate('/emergency')}
            >
              <span className="quick-action-icon">
                <Siren size={25} />
              </span>

              <span className="quick-action-text">
                <strong>Protokol Darurat</strong>
                <small>
                  Aktifkan prosedur keamanan sekolah
                </small>
              </span>

              <ArrowUpRight size={20} />
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={scrollToCamera}
            >
              <span className="quick-action-icon blue">
                <Camera size={25} />
              </span>

              <span className="quick-action-text">
                <strong>Pantauan CCTV</strong>
                <small>
                  Lihat seluruh kamera secara langsung
                </small>
              </span>

              <ChevronRight size={20} />
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                setShowVisitorModal(true)
              }
            >
              <span className="quick-action-icon purple">
                <UserPlus size={25} />
              </span>

              <span className="quick-action-text">
                <strong>Catat Pengunjung</strong>
                <small>
                  Tambahkan data tamu yang datang
                </small>
              </span>

              <Plus size={20} />
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={() => navigate('/reports')}
            >
              <span className="quick-action-icon green">
                <FileText size={25} />
              </span>

              <span className="quick-action-text">
                <strong>Buat Laporan</strong>
                <small>
                  Catat pemeriksaan atau kejadian baru
                </small>
              </span>

              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        <section
          className="security-section"
          id="camera-section"
        >
          <div className="security-section-header">
            <div>
              <span className="panel-eyebrow">
                Live monitoring
              </span>

              <h2>Pantauan Kamera</h2>
            </div>

            <button
              type="button"
              className="section-link-button"
              onClick={() => navigate('/monitoring')}
            >
              Lihat semua
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="camera-dashboard-grid">
            {cameraFeeds.map((camera) => (
              <article
                className="camera-dashboard-card"
                key={camera.id}
              >
                <div
                  className="camera-dashboard-image"
                  style={{
                    backgroundImage: `
                      linear-gradient(
                        180deg,
                        rgba(15, 23, 42, 0.04),
                        rgba(15, 23, 42, 0.7)
                      ),
                      url("${camera.image}")
                    `,
                  }}
                >
                  <span className="camera-live-badge">
                    <Radio size={12} />
                    LIVE
                  </span>

                  <button
                    type="button"
                    className="camera-fullscreen-button"
                    onClick={() =>
                      setSelectedCamera(camera)
                    }
                    aria-label={`Perbesar kamera ${camera.name}`}
                  >
                    <Maximize2 size={18} />
                  </button>

                  <div className="camera-image-info">
                    <strong>{camera.name}</strong>
                    <span>{camera.location}</span>
                  </div>
                </div>

                <div className="camera-dashboard-footer">
                  <span>
                    <span className="camera-online-dot" />
                    {camera.status}
                  </span>

                  <small>
                    Diperbarui {formattedTime}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="security-section">
          <div className="security-section-header">
            <div>
              <span className="panel-eyebrow">
                Aktivitas terbaru
              </span>

              <h2>Laporan Keamanan</h2>
            </div>

            <button
              type="button"
              className="section-link-button"
              onClick={() => navigate('/reports')}
            >
              Semua laporan
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="security-report-panel">
            <div className="security-report-toolbar">
              <label>
                <Search size={18} />

                <input
                  type="search"
                  value={reportQuery}
                  onChange={(e) => setReportQuery(e.target.value)}
                  placeholder="Cari laporan..."
                />
              </label>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <Loader2 size={24} className="spin" style={{ marginRight: 8 }} />
                Memuat data panic alert...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <ShieldCheck size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
                <strong>Tidak ada panic alert</strong>
                <small style={{ display: 'block' }}>Semua area dalam keadaan aman.</small>
              </div>
            ) : (
              <>
                <div className="security-report-table-wrapper">
                  <table className="security-report-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Siswa / Guru</th>
                        <th>Lokasi</th>
                        <th>Kelas</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAlerts.map((alert) => (
                        <tr key={alert.id}>
                          <td>
                            <div className="report-time">
                              <Clock3 size={15} />
                              {formatAlertTime(alert.created_at)}
                            </div>
                          </td>

                          <td>
                            <div className="report-event">
                              <span className={`report-event-icon ${statusClass(alert.status)}`}>
                                {alert.status === 'resolved' || alert.status === 'Selesai' ? (
                                  <CheckCircle2 size={17} />
                                ) : (
                                  <AlertTriangle size={17} />
                                )}
                              </span>
                              <div>
                                <strong>{alert.student_name || 'Tidak diketahui'}</strong>
                                <small style={{ display: 'block', fontSize: 11, color: '#94a3b8' }}>
                                  Guru: {alert.triggered_by_name || '-'}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="report-location">
                              <MapPin size={15} />
                              {alert.location_name || 'Tidak tersedia'}
                            </div>
                          </td>

                          <td>{alert.class_name || '-'}</td>

                          <td>
                            <span className={`report-status ${statusClass(alert.status)}`}>
                              {statusLabel(alert.status)}
                            </span>
                          </td>

                          <td>
                              {(alert.status === 'pending' || alert.status === 'Perlu tindakan') ? (
                                <button
                                  type="button"
                                  className="report-handle-button"
                                  onClick={() => respondPanicAlert(alert.id)}
                                >
                                  Saya Menuju Lokasi
                                </button>
                              ) : alert.status === 'responding' ? (
                                <button
                                  type="button"
                                  className="report-detail-button"
                                  onClick={() => resolvePanicAlert(alert.id)}
                                >
                                  Selesai Ditangani
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 13 }}>Ditangani</span>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="security-report-mobile">
                  {filteredAlerts.map((alert) => (
                    <article className="mobile-report-card" key={alert.id}>
                      <div className="mobile-report-head">
                        <span className={`report-event-icon ${statusClass(alert.status)}`}>
                          {alert.status === 'resolved' || alert.status === 'Selesai' ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                        </span>

                        <div>
                          <strong>{alert.student_name || 'Tidak diketahui'}</strong>
                          <small>
                            {formatAlertTime(alert.created_at)} · {alert.class_name || '-'}
                          </small>
                          <small style={{ display: 'block', color: '#94a3b8' }}>
                            Guru: {alert.triggered_by_name || '-'}
                          </small>
                        </div>

                        <span className={`report-status ${statusClass(alert.status)}`}>
                          {statusLabel(alert.status)}
                        </span>
                      </div>

                      <div className="mobile-report-footer">
                        <span>
                          <MapPin size={13} />
                          {alert.location_name || 'Tidak tersedia'}
                        </span>
                        {alert.note && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                            <MessageSquareText size={13} />
                            {alert.note}
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {(alert.status === 'pending' || alert.status === 'Perlu tindakan') && (
                            <button onClick={() => respondPanicAlert(alert.id)}>
                              Saya Menuju Lokasi
                            </button>
                          )}
                          {alert.status === 'responding' && (
                            <button onClick={() => resolvePanicAlert(alert.id)}>
                              Selesai Ditangani
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {showVisitorModal && (
        <div
          className="dashboard-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            setShowVisitorModal(false)
          }
        >
          <form
            className="dashboard-modal"
            onSubmit={handleAddVisitor}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="dashboard-modal-header">
              <div>
                <span className="panel-eyebrow">
                  Data pengunjung
                </span>

                <h2>Tambahkan Pengunjung</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowVisitorModal(false)
                }
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <label className="dashboard-field">
              <span>Nama pengunjung</span>

              <input
                type="text"
                value={visitorForm.name}
                onChange={(event) =>
                  setVisitorForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Masukkan nama lengkap"
                autoFocus
              />
            </label>

            <label className="dashboard-field">
              <span>Tujuan kunjungan</span>

              <textarea
                rows="4"
                value={visitorForm.purpose}
                onChange={(event) =>
                  setVisitorForm((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
                placeholder="Contoh: Pertemuan dengan wali kelas"
              />
            </label>

            <div className="dashboard-modal-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() =>
                  setShowVisitorModal(false)
                }
              >
                Batal
              </button>

              <button
                type="submit"
                className="modal-save-button"
              >
                <UserPlus size={18} />
                Simpan Pengunjung
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedCamera && (
        <div
          className="dashboard-modal-backdrop camera-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            setSelectedCamera(null)
          }
        >
          <div
            className="camera-preview-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="camera-preview-image"
              style={{
                backgroundImage: `
                  linear-gradient(
                    180deg,
                    rgba(15, 23, 42, 0.02),
                    rgba(15, 23, 42, 0.52)
                  ),
                  url("${selectedCamera.image}")
                `,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedCamera(null)
                }
                aria-label="Tutup kamera"
              >
                <X size={22} />
              </button>

              <span className="camera-live-badge">
                <Radio size={12} />
                LIVE
              </span>

              <div>
                <strong>
                  {selectedCamera.name}
                </strong>
                <span>
                  {selectedCamera.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}