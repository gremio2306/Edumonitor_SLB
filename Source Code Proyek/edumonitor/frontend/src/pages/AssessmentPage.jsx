import { Save, Smile, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, Chip } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { statusFromScore } from '../utils/helpers'

const quickTags = ['Kooperatif', 'Butuh Bantuan', 'Fokus Stabil', 'Mandiri']

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { auth } = useAuth()
  const { students, reports, addReport, updateReport, deleteReport, showToast } = useApp()
  const editingReport = editId ? reports.find((r) => String(r.id) === editId) : null

  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [method, setMethod] = useState('Observasi')
  const [score, setScore] = useState(85)
  const [stars, setStars] = useState(4)
  const [note, setNote] = useState('')
  const [tags, setTags] = useState(['Kooperatif'])

  const student = students.find((s) => s.id === studentId)

  useEffect(() => {
    if (editingReport) {
      setStudentId(editingReport.studentId || students[0]?.id || '')
      setMethod(editingReport.category?.replace('Penilaian ', '') || 'Observasi')
      setScore(editingReport.score || 85)
      setStars(editingReport.stars || 4)
      setNote(editingReport.note || '')
      setTags(editingReport.tags || ['Kooperatif'])
    }
  }, [editingReport])

  const save = () => {
    if (!student) {
      showToast('Pilih siswa terlebih dahulu', 'error')
      return
    }

    const payload = {
      studentId: student.id,
      student: student.name,
      date: new Date().toISOString().slice(0, 10),
      category: `Penilaian ${method}`,
      status: statusFromScore(score),
      score,
      stars,
      note: note || 'Penilaian interaksi dan fokus siswa.',
      author: auth?.name || 'Bu Maria',
      tags,
    }

    if (editingReport) {
      updateReport(editingReport.id, payload)
    } else {
      addReport(payload)
    }

    navigate('/reports')
  }

  const handleDelete = () => {
    if (!editingReport) return
    const confirmed = window.confirm(`Hapus assessment ini?`)
    if (!confirmed) return
    deleteReport(editingReport.id)
    showToast('Assessment berhasil dihapus')
    navigate('/reports')
  }

  return (
    <div className="page padded-page assessment-page">
      <Header title={editingReport ? 'Edit Penilaian' : 'Input Penilaian'} back />
      <label className="field-label">PILIH SISWA</label>
      <div className="input-with-icon"><UserRound size={20} /><select required value={studentId} onChange={(e) => setStudentId(e.target.value)}>{students.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.className}</option>)}</select></div>
      {student && <Card className="selected-student-card"><span className="soft-icon purple"><Smile /></span><div><strong>{student.name}</strong><small>{student.className} - SLB Harapan Bunda</small></div></Card>}
      <label className="field-label">METODE PENILAIAN</label>
      <div className="segmented-control">{['Observasi', 'Tes Lisan', 'Tertulis'].map((item) => <button key={item} className={method === item ? 'active' : ''} onClick={() => setMethod(item)}>{item}</button>)}</div>
      <Card className="score-card"><div className="score-head"><span>Skor Pencapaian</span><strong>{score}<small>dari 100</small></strong></div><input type="range" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} /><div className="range-labels"><span>Kurang</span><span>Cukup</span><span>Baik</span><span>Sangat Baik</span></div></Card>
      <Card className="rating-card"><strong>Kualitas Interaksi & Fokus</strong><div className="stars">{[1,2,3,4,5].map((star) => <button key={star} className={star <= stars ? 'active' : ''} onClick={() => setStars(star)}>★</button>)}</div><p>Anak menunjukkan fokus yang {stars >= 4 ? 'sangat baik' : 'cukup'} selama sesi.</p></Card>
      <label><span className="field-label">CATATAN DETAIL OBSERVASI</span><textarea rows="6" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuliskan perkembangan spesifik atau hambatan yang ditemukan hari ini..." /></label>
      <span className="form-caption">Tag Cepat</span><div className="horizontal-chips wrap">{quickTags.map((tag) => <Chip key={tag} active={tags.includes(tag)} onClick={() => setTags((items) => items.includes(tag) ? items.filter((x) => x !== tag) : [...items, tag])}>{tag}</Chip>)}</div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button className="primary-button sticky-submit" style={{ flex: 1 }} onClick={save}><Save size={19} /> {editingReport ? 'Simpan Perubahan' : 'Simpan Penilaian'}</button>
        {editingReport && <button className="primary-button" style={{ flex: '0 0 auto', background: '#dc2626' }} onClick={handleDelete}><Trash2 size={19} /></button>}
      </div>
    </div>
  )
}
