import { Edit3, FilePlus2, GraduationCap, Info, Share2, Trash2, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, ProgressBar, SectionTitle } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import rizkyImage from '../assets/student-rizky.png'

const filters = ['Autisme', 'ADHD', 'Disleksia', 'Umum']

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { auth } = useAuth()
  const { students, reports, updateStudent, deleteStudent, showToast } = useApp()
  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', birth: '', className: '', category: '' })

  const student = students.find((item) => item.id === id)

  if (!student) {
    return (
      <div className="page padded-page student-detail-page professional-subpage">
        <div className="detail-header-row"><Header title="EduMonitor" back compact/></div>
        <div className="empty-state card" style={{ marginTop: '2rem' }}>
          <strong>Siswa tidak ditemukan</strong>
          <span>Siswa dengan ID tersebut tidak ada dalam sistem.</span>
          <button className="primary-button" style={{ marginTop: '1rem' }} onClick={() => navigate('/students')}>
            Kembali ke daftar siswa
          </button>
        </div>
      </div>
    )
  }

  const studentReports = useMemo(
    () => reports.filter((item) => item.studentId === student.id),
    [reports, student.id],
  )

  const recentReports = useMemo(
    () => studentReports.slice(0, 5),
    [studentReports],
  )

  const assessmentReports = useMemo(
    () => studentReports.filter((r) => r.score > 0).slice(0, 3),
    [studentReports],
  )

  const chartTrend = useMemo(() => {
    if (studentReports.length < 2) return null
    const sorted = [...studentReports].sort((a, b) => a.id - b.id)
    const first = sorted[0].score
    const last = sorted[sorted.length - 1].score
    return { change: last - first, direction: last >= first ? 'up' : 'down' }
  }, [studentReports])

  const averageScore = useMemo(() => {
    if (studentReports.length === 0) return student.progress
    const total = studentReports.reduce((sum, r) => sum + r.score, 0)
    return Math.round(total / studentReports.length)
  }, [studentReports, student.progress])

  const handleEdit = () => {
    setEditForm({
      name: student.name || '',
      birth: student.birth || '',
      className: student.className || '',
      category: student.category || 'Autisme',
    })
    setShowEditForm(true)
  }

  const submitEdit = (event) => {
    event.preventDefault()
    const trimmed = {
      name: editForm.name.trim(),
      birth: editForm.birth.trim(),
      className: editForm.className.trim(),
      category: editForm.category,
    }
    if (!trimmed.name || !trimmed.birth || !trimmed.className) {
      showToast('Nama, tanggal lahir, dan kelas wajib diisi', 'error')
      return
    }
    const initials = trimmed.name.split(' ').map((i) => i[0]).join('').slice(0, 2).toUpperCase()
    updateStudent(student.id, { ...trimmed, initials })
    setShowEditForm(false)
    showToast('Data siswa berhasil diperbarui', 'success')
  }

  const handleDelete = () => {
    const confirmed = window.confirm(`Hapus data siswa "${student.name}"?`)
    if (!confirmed) return
    deleteStudent(student.id)
    showToast('Data siswa berhasil dihapus')
    navigate('/students')
  }

  const canManage = auth?.role === 'admin' || auth?.role === 'teacher'

  return (
   <div className="page padded-page student-detail-page professional-subpage">
      <div className="detail-header-row">
        <Header title="EduMonitor" back compact/>
        {canManage && <button className="icon-button" onClick={handleDelete}><Trash2 size={18} /></button>}
        <button className="icon-button" onClick={()=>showToast('Tautan profil siswa disalin','info')}><Share2/></button>
      </div>

      <div className="student-hero">
        <div className="student-photo-wrap">
          <Avatar image={student.name.includes('Rizky')?rizkyImage:undefined} initials={student.initials} size={110}/>
          {canManage && <button onClick={handleEdit}><Edit3 size={17}/></button>}
        </div>
        <h1>{student.name}</h1>
        <span className="student-category-pill">SPEKTRUM {student.category.toUpperCase()}</span>
        <p>Siswa {student.className} • Bergabung sejak Jan 2023</p>
      </div>

      <Card className="student-chart-card">
        <div><strong>Grafik Perkembangan</strong><button className="link-button">Mingguan</button></div>
        <svg viewBox="0 0 320 120">
          <path d="M10 96 C50 87 70 72 105 78 S155 55 190 62 S245 35 310 24" fill="none" stroke="#6f35e7" strokeWidth="5" strokeLinecap="round"/>
          <path d="M10 96 C50 87 70 72 105 78 S155 55 190 62 S245 35 310 24 L310 115 L10 115 Z" fill="#6f35e71a"/>
        </svg>
        <div className="chart-days"><span>Sen</span><span>Sel</span><b>Rab</b><span>Kam</span><span>Jum</span></div>
        <p>
          <span className="text-purple">
            {chartTrend ? (chartTrend.direction === 'up' ? '↗' : '↘') : '—'}
          </span>
          {chartTrend
            ? `${chartTrend.direction === 'up' ? 'Peningkatan' : 'Penurunan'} Skor ${Math.abs(chartTrend.change)}%`
            : 'Belum ada data perkembangan'}
          <Info size={18}/>
        </p>
      </Card>

      <div className="two-column-cards">
        <Card className="detail-metric">
          <small>INDEKS PERKEMBANGAN</small>
          <strong>{averageScore}<span>/100</span></strong>
          <ProgressBar value={averageScore} tone="blue"/>
        </Card>
        <Card className="detail-metric">
          <small>KONDISI KHUSUS</small>
          <strong>{student.category}</strong>
          <p>{student.className} • ID: #{student.id}</p>
        </Card>
      </div>

      {assessmentReports.length > 0 && (
        <>
          <SectionTitle title="Hasil Assessment" />
          <div className="stack">
            {assessmentReports.map((report) => (
              <Card key={report.id} className="teacher-note-card">
                <span className="soft-icon purple"><GraduationCap size={22} /></span>
                <div>
                  <strong>{report.category}</strong>
                  <small>{report.date}</small>
                  <p>{report.note}</p>
                  <span className="author-line">
                    <Avatar initials={report.author?.split(' ').map(x=>x[0]).join('').slice(0,2)} size={24}/>
                    {report.author} • Skor: {report.score}% • {report.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle title="Riwayat Perkembangan" action={studentReports.length > 0 ? `${studentReports.length} Catatan` : ''} onAction={studentReports.length > 0 ? () => navigate('/history') : undefined} />

      {recentReports.length > 0 ? (
        <div className="stack">
          {recentReports.map((item, index) => (
            <Card key={item.id} className="teacher-note-card">
              <span className={`soft-icon ${index % 2 === 0 ? 'peach' : 'purple'}`}>
                {index % 2 === 0 ? <Users size={22} /> : <FilePlus2 size={22} />}
              </span>
              <div>
                <strong>{item.category}</strong>
                <small>{item.date}</small>
                <p>{item.note}</p>
                <span className="author-line">
                  <Avatar initials={item.author?.split(' ').map(x=>x[0]).join('').slice(0,2)} size={24}/>
                  {item.author} • {item.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <strong>Belum ada catatan perkembangan</strong>
          <span>Catatan perkembangan akan muncul di sini.</span>
        </div>
      )}

      {canManage && (
        <button className="fab" onClick={() => navigate('/progress/new')}><FilePlus2/></button>
      )}

      {showEditForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowEditForm(false)}>
          <form className="modal-card" onSubmit={submitEdit} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-title">
              <h2>Ubah Data Siswa</h2>
              <button type="button" aria-label="Tutup" onClick={() => setShowEditForm(false)}><X /></button>
            </div>
            <label>
              ID Siswa
              <input type="text" value={`#${student.id}`} disabled />
            </label>
            <label>
              Nama siswa
              <input required autoFocus value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </label>
            <label>
              Tanggal lahir
              <input required value={editForm.birth} placeholder="12 Jan 2016" onChange={(e) => setEditForm({ ...editForm, birth: e.target.value })} />
            </label>
            <label>
              Kelas
              <input required value={editForm.className} placeholder="Kelas 2-A" onChange={(e) => setEditForm({ ...editForm, className: e.target.value })} />
            </label>
            <label>
              Kondisi Khusus
              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                {filters.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button className="primary-button" type="submit"><Edit3 size={18} /> Simpan Perubahan</button>
          </form>
        </div>
      )}
    </div>
  )
}
