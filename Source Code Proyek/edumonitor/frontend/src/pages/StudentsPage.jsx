import { ArrowDownUp, CalendarDays, MoreVertical, Pencil, School, Trash2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, Chip, SearchBox, SectionTitle } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useSearchFilter } from '../hooks/useSearchFilter'

const filters = ['Semua', 'Autisme', 'ADHD', 'Disleksia', 'Umum']
const initialForm = { name: '', birth: '', className: '', category: 'Autisme' }

export default function StudentsPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { students, addStudent, updateStudent, deleteStudent, showToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const { query, setQuery, filter, setFilter, sortBy, setSortBy, sortDir, setSortDir, data } = useSearchFilter(students, {
    fields: ['name', 'id', 'className', 'category'],
    filterKey: 'category',
    filterOptions: filters,
    defaultField: 'name',
  })

  const canManage = auth?.role === 'admin' || auth?.role === 'teacher'

  const closeForm = () => { setShowForm(false); setEditingStudent(null); setForm(initialForm) }

  const openEdit = (student) => {
    setEditingStudent(student)
    setForm({ name: student.name || '', birth: student.birth || '', className: student.className || '', category: student.category || 'Autisme' })
    setActiveMenuId(null)
    setShowForm(true)
  }

  const submit = (e) => {
    e.preventDefault()
    const trimmed = { name: form.name.trim(), birth: form.birth.trim(), className: form.className.trim(), category: form.category }
    if (!trimmed.name || !trimmed.birth || !trimmed.className) { showToast('Nama, tanggal lahir, dan kelas wajib diisi', 'error'); return }
    const initials = trimmed.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    if (editingStudent) { updateStudent(editingStudent.id, { ...trimmed, initials }) } else { addStudent({ ...trimmed, initials, tone: 'blue', progress: 0 }) }
    closeForm()
  }

  const remove = (student) => { if (window.confirm(`Hapus data siswa "${student.name}"?`)) { deleteStudent(student.id); setActiveMenuId(null) } }

  return (
    <div className="page padded-page students-page">
      <Header />
      <div className="title-with-button students-page-heading">
        <div><h1>Data Siswa</h1><p>Total {students.length} Siswa</p></div>
        {canManage && <button type="button" className="small-primary" onClick={() => { setEditingStudent(null); setForm(initialForm); setShowForm(true) }}><UserPlus size={18} /> Tambah Siswa</button>}
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Cari nama atau ID siswa..." />
      <div className="horizontal-chips">{filters.map((item) => <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Chip>)}</div>
      <div className="sort-control-row">
        <ArrowDownUp size={15} /><span>Urutkan</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="name">Nama</option><option value="className">Kelas</option><option value="category">Kategori</option></select>
        <button className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>{sortDir === 'asc' ? '↑' : '↓'}</button>
      </div>
      <SectionTitle title="Daftar Siswa" action={`${data.length} Siswa`} />
      <div className="stack">
        {data.length > 0 ? data.map((student) => (
          <Card key={student.id} className="student-list-card" onClick={() => navigate(`/student/${student.id}`)}>
            <Avatar initials={student.initials} size={64} className={`avatar-${student.tone}`} />
            <div className="student-card-text">
              <strong>{student.name}</strong>
              <small>ID: #{student.id}</small>
              <span><CalendarDays size={15} /> {student.birth} <School size={15} /> {student.className}</span>
            </div>
            <span className={`category-badge ${student.category.toLowerCase()}`}>{student.category}</span>
            {canManage && (
              <div className="master-card-actions" style={{ position: 'absolute', top: '15px', right: '10px', zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="icon-button" onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}><MoreVertical size={18} /></button>
                {activeMenuId === student.id && (
                  <div className="master-action-menu">
                    <button type="button" onClick={() => openEdit(student)}><Pencil size={16} /> Ubah</button>
                    <button type="button" className="danger" onClick={() => remove(student)}><Trash2 size={16} /> Hapus</button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )) : <div className="empty-state card"><strong>Siswa tidak ditemukan</strong><span>Gunakan nama, ID, atau filter yang berbeda.</span></div>}
      </div>
      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeForm}>
          <form className="modal-card" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title"><h2>{editingStudent ? 'Ubah Siswa' : 'Tambah Siswa'}</h2><button type="button" onClick={closeForm}><X /></button></div>
            {editingStudent && <label>ID Siswa<input type="text" value={`#${editingStudent.id}`} disabled /></label>}
            <label>Nama siswa<input required autoFocus value={form.name} placeholder="Masukkan nama lengkap" onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Tanggal lahir<input required value={form.birth} placeholder="12 Jan 2016" onChange={(e) => setForm({ ...form, birth: e.target.value })} /></label>
            <label>Kelas<input required value={form.className} placeholder="Kelas 2-A" onChange={(e) => setForm({ ...form, className: e.target.value })} /></label>
            <label>Kondisi Khusus<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{filters.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="primary-button" type="submit">{editingStudent ? <Pencil size={18} /> : <UserPlus size={18} />} {editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
