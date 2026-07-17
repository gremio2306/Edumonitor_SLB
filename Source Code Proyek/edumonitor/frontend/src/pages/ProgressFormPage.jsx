import { Camera, Save, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { scoreFromStatus } from '../utils/helpers'

const statuses = [
  { code: 'BB', label: 'Belum Berkembang' },
  { code: 'MB', label: 'Mulai Berkembang' },
  { code: 'BSH', label: 'Sesuai Harapan' },
  { code: 'BSB', label: 'Sangat Baik' },
]

export default function ProgressFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { auth } = useAuth()
  const { students, reports, addReport, updateReport, showToast } = useApp()
  const editingReport = editId ? reports.find((r) => String(r.id) === editId) : null

  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState('Kognitif')
  const [status, setStatus] = useState('BSH')
  const [note, setNote] = useState('')
  const [photoName, setPhotoName] = useState('')

  useEffect(() => {
    if (editingReport) {
      setStudentId(editingReport.studentId || students[0]?.id || '')
      setDate(editingReport.date || new Date().toISOString().slice(0, 10))
      setCategory(editingReport.category || 'Kognitif')
      setStatus(editingReport.status || 'BSH')
      setNote(editingReport.note || '')
      setPhotoName(editingReport.photoName || '')
    }
  }, [editingReport])

  const submit = (e) => {
    e.preventDefault()
    const student = students.find((item) => item.id === studentId)
    if (!student) { showToast('Pilih siswa terlebih dahulu', 'error'); return }
    if (!note.trim()) { showToast('Catatan perkembangan wajib diisi', 'error'); return }

    const payload = {
      studentId, student: student.name, date, category, status,
      score: scoreFromStatus(status), note,
      author: auth?.name || 'Bu Maria', photoName,
    }

    if (editingReport) { updateReport(editingReport.id, payload) } else { addReport(payload) }
    navigate('/monitoring')
  }

  return (
    <div className="page padded-page form-page">
      <Header title="EduMonitor" back />
      <h1 className="page-heading">{editingReport ? 'Edit Perkembangan' : 'Input Perkembangan'}</h1>
      <p className="page-subtitle">{editingReport ? 'Perbarui data perkembangan siswa.' : 'Catat kemajuan harian siswa dengan detail dan akurat.'}</p>
      <form onSubmit={submit} className="report-form">
        <label className="field-label">PILIH SISWA</label>
        <div className="input-with-icon"><UserRound size={20} /><select required value={studentId} onChange={(e) => setStudentId(e.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></div>
        <div className="two-fields">
          <label><span className="field-label">TANGGAL</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label><span className="field-label">KATEGORI</span><select value={category} onChange={(e) => setCategory(e.target.value)}><option>Kognitif</option><option>Motorik Halus</option><option>Interaksi Sosial</option><option>Perilaku</option><option>Kemandirian</option></select></label>
        </div>
        <label className="field-label">STATUS CAPAIAN</label>
        <div className="status-selector">{statuses.map((item) => <button type="button" key={item.code} className={status === item.code ? 'active' : ''} onClick={() => setStatus(item.code)}><strong>{item.code}</strong><small>{item.label}</small></button>)}</div>
        <label><span className="field-label">CATATAN PERKEMBANGAN</span><textarea required rows="7" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuliskan detail pengamatan atau kejadian penting..." /></label>
        <label className="photo-upload"><Camera /><span><strong>Tambah Foto Bukti</strong><small>{photoName || 'Lampirkan foto kegiatan siswa (Opsional)'}</small></span><input type="file" accept="image/*" onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')} /></label>
        <button className="primary-button" type="submit"><Save size={20} /> {editingReport ? 'Simpan Perubahan' : 'Simpan Laporan'}</button>
      </form>
    </div>
  )
}
