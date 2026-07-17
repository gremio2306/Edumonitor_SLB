import { Camera, Mic, Save, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { Card, Chip } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const tags = ['Fokus Baik', 'Tantrum Ringan', 'Inisiatif Baru', 'Interaksi Sosial', 'Makan Mandiri']

export default function JournalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { auth } = useAuth()
  const { students, reports, addReport, updateReport, deleteReport, showToast } = useApp()
  const editingReport = editId ? reports.find((r) => String(r.id) === editId) : null

  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [selectedTags, setSelectedTags] = useState(['Fokus Baik'])
  const [note, setNote] = useState('')
  const [journalQuery, setJournalQuery] = useState('')

  useEffect(() => {
    if (editingReport) {
      setStudentId(editingReport.studentId || students[0]?.id || '')
      setSelectedTags(editingReport.tags || ['Fokus Baik'])
      setNote(editingReport.note || '')
    }
  }, [editingReport])

  const recentJournals = useMemo(() => {
    const keyword = journalQuery.trim().toLowerCase()
    return reports
      .filter((r) => {
        if (r.category !== 'Jurnal Harian') return false
        if (!keyword) return true
        return [r.student, r.note, r.author, ...(r.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
      .slice(0, 8)
  }, [reports, journalQuery])

  const save = () => {
    const student = students.find((item) => item.id === studentId)
    if (!student) {
      showToast('Pilih siswa terlebih dahulu', 'error')
      return
    }

    if (!note.trim() && selectedTags.length === 0) {
      showToast('Isi catatan atau pilih tag perilaku', 'error')
      return
    }

    const payload = {
      studentId,
      student: student.name,
      date: new Date().toISOString().slice(0, 10),
      category: 'Jurnal Harian',
      status: 'BSH',
      score: 75,
      note: note.trim() || selectedTags.join(', '),
      author: auth?.name || 'Bu Maria',
      tags: selectedTags,
    }

    if (editingReport) {
      updateReport(editingReport.id, payload)
    } else {
      addReport(payload)
    }

    navigate('/history')
  }

  const handleDelete = () => {
    if (!editingReport) return
    const confirmed = window.confirm(`Hapus jurnal ini?`)
    if (!confirmed) return
    deleteReport(editingReport.id)
    showToast('Jurnal berhasil dihapus')
    navigate('/history')
  }

  return (
    <div className="page padded-page journal-page">
      <Header title={editingReport ? 'Edit Jurnal' : 'Jurnal Harian'} back />
      <p className="date-text">Rabu, 22 Mei 2024</p>
      <h1 className="page-heading">{editingReport ? 'Edit Jurnal' : 'Input Jurnal'}</h1>
      <Card className="journal-card">
        <label className="field-label">Pilih Siswa</label>
        <div className="horizontal-chips">{students.map((student) => <Chip key={student.id} active={studentId === student.id} onClick={() => setStudentId(student.id)}>{student.name}</Chip>)}</div>
        <label className="field-label">Tag Cepat Perilaku</label>
        <div className="horizontal-chips wrap">{tags.map((tag) => <Chip key={tag} active={selectedTags.includes(tag)} onClick={() => setSelectedTags((items) => items.includes(tag) ? items.filter((x) => x !== tag) : [...items, tag])}>{tag}</Chip>)}</div>
        <label className="field-label">Catatan Aktivitas & Kejadian Khusus</label>
        <div className="journal-textarea"><textarea rows="8" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuliskan perkembangan siswa hari ini..." /><div><button onClick={() => setNote((text) => `${text}${text ? ' ' : ''}[Catatan suara direkam]`)}><Mic /></button><button><Camera /></button></div></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-button" style={{ flex: 1 }} onClick={save}><Save size={19} /> {editingReport ? 'Simpan Perubahan' : 'Simpan Jurnal'}</button>
          {editingReport && <button className="primary-button" style={{ flex: '0 0 auto', background: '#dc2626' }} onClick={handleDelete}><Trash2 size={19} /></button>}
        </div>
      </Card>
      <div className="search-filter-row" style={{ margin: '12px 0' }}>
        <label className="search-box">
          <Search size={18} />
          <input type="search" value={journalQuery} onChange={(e) => setJournalQuery(e.target.value)} placeholder="Cari jurnal..." />
        </label>
      </div>
      <h2>Input Terakhir</h2>
      <div className="two-column-cards">
        {recentJournals.length > 0 ? (
          recentJournals.map((entry) => (
            <Card key={entry.id} className="recent-journal">
              <b>{entry.date?.slice(5) || '-'}</b>
              <strong>{entry.student}</strong>
              <small>{entry.note?.slice(0, 40)}...</small>
            </Card>
          ))
        ) : (
          <Card className="recent-journal" style={{ gridColumn: '1 / -1' }}>
            <strong>Belum ada jurnal</strong>
            <small>Jurnal harian akan muncul di sini.</small>
          </Card>
        )}
      </div>
    </div>
  )
}
