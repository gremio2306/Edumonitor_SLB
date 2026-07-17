import { ArrowDownUp, Eye, Mail, MoreVertical, Pencil, Phone, Trash2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, Chip, SearchBox } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useSearchFilter } from '../hooks/useSearchFilter'
import { formatTeacherId, getFallbackPath } from '../utils/helpers'

const tabs = ['Semua', 'Wali Kelas', 'Terapis', 'Admin']
const initialForm = { name: '', email: '', phone: '', role: 'Wali Kelas', meta: 'Aktif' }

export default function TeachersPage() {
  const { auth } = useAuth()
  const { teachers, addTeacher, updateTeacher, deleteTeacher, showToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [detailTeacher, setDetailTeacher] = useState(null)

  const { query, setQuery, filter, setFilter, sortBy, setSortBy, sortDir, setSortDir, data } = useSearchFilter(teachers, {
    fields: ['id', 'name', 'email', 'phone', 'role', 'meta'],
    filterKey: 'role',
    filterOptions: tabs,
    defaultField: 'name',
  })

  if (auth?.role !== 'admin') return <Navigate to={getFallbackPath(auth?.role)} replace />

  const closeForm = () => { setShowForm(false); setEditingTeacher(null); setForm(initialForm) }

  const openAddForm = () => { setEditingTeacher(null); setForm(initialForm); setActiveMenuId(null); setShowForm(true) }

  const openEditForm = (teacher) => {
    setEditingTeacher(teacher)
    setForm({ name: teacher.name || '', email: teacher.email || '', phone: teacher.phone || '', role: teacher.role || 'Wali Kelas', meta: teacher.meta || 'Aktif' })
    setActiveMenuId(null)
    setShowForm(true)
  }

  const submitTeacher = (e) => {
    e.preventDefault()
    const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, meta: form.meta }
    if (!payload.name || !payload.email || !payload.phone) { showToast('Nama, email, dan nomor HP wajib diisi', 'error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { showToast('Format email belum valid', 'error'); return }
    if (editingTeacher) { updateTeacher(editingTeacher.id, payload) } else { addTeacher(payload) }
    closeForm()
  }

  const removeTeacher = (teacher) => { if (window.confirm(`Hapus data guru "${teacher.name}"?`)) { deleteTeacher(teacher.id); setActiveMenuId(null) } }

  return (
    <div className="page padded-page teachers-page">
      <Header />
      <div className="title-with-button teachers-page-heading">
        <div><h1>Kelola Guru</h1><p>Total {teachers.length} Tenaga Pendidik</p></div>
        <button type="button" className="small-primary" onClick={openAddForm}><UserPlus size={18} /> Tambah Guru</button>
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Cari ID, nama, email, atau peran guru..." />
      <div className="horizontal-chips">{tabs.map((item) => <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Chip>)}</div>
      <div className="sort-control-row">
        <ArrowDownUp size={15} /><span>Urutkan</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="name">Nama</option><option value="role">Peran</option></select>
        <button className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>{sortDir === 'asc' ? '↑' : '↓'}</button>
      </div>
      <div className="stack teacher-stack">
        {data.length > 0 ? data.map((teacher) => (
          <Card key={teacher.id} className="teacher-card">
            <Avatar initials={teacher.initials} size={54} />
            <div className="master-card-copy">
              <strong>{teacher.name}</strong>
              <small className="master-id-label">ID Guru: {formatTeacherId(teacher.id)}</small>
              <small>{teacher.role}<span> • </span>{teacher.meta}</small>
              <small className="master-meta-row"><Mail size={14} />{teacher.email || '-'}</small>
              <small className="master-meta-row"><Phone size={14} />{teacher.phone || '-'}</small>
            </div>
            <div className="master-card-actions">
              <button type="button" className="icon-button" onClick={() => setActiveMenuId(activeMenuId === teacher.id ? null : teacher.id)}><MoreVertical /></button>
              {activeMenuId === teacher.id && (
                <div className="master-action-menu">
                  <button type="button" onClick={() => { setDetailTeacher(teacher); setActiveMenuId(null) }}><Eye size={16} /> Detail</button>
                  <button type="button" onClick={() => openEditForm(teacher)}><Pencil size={16} /> Ubah</button>
                  <button type="button" className="danger" onClick={() => removeTeacher(teacher)}><Trash2 size={16} /> Hapus</button>
                </div>
              )}
            </div>
          </Card>
        )) : <div className="empty-state card"><strong>Guru tidak ditemukan</strong><span>Gunakan nama, ID, email, atau filter yang berbeda.</span></div>}
      </div>
      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeForm}>
          <form className="modal-card" onSubmit={submitTeacher} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title"><h2>{editingTeacher ? 'Ubah Guru' : 'Tambah Guru'}</h2><button type="button" onClick={closeForm}><X /></button></div>
            {editingTeacher && <label>ID Guru<input type="text" value={formatTeacherId(editingTeacher.id)} disabled /></label>}
            <label>Nama lengkap<input required autoFocus value={form.name} placeholder="Masukkan nama guru" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
            <label>Email<input type="email" required value={form.email} placeholder="guru@edumonitor.id" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></label>
            <label>Nomor HP<input type="tel" required value={form.phone} placeholder="Contoh: 0812-3456-7890" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></label>
            <label>Peran<select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}><option value="Wali Kelas">Wali Kelas</option><option value="Terapis Wicara">Terapis Wicara</option><option value="Admin">Admin</option><option value="Kepala Sekolah">Kepala Sekolah</option><option value="Guru Olahraga">Guru Olahraga</option></select></label>
            <label>Status<select value={form.meta} onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}><option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option><option value="Cuti">Cuti</option><option value="Luar Kota">Luar Kota</option></select></label>
            <button className="primary-button" type="submit">{editingTeacher ? <Pencil size={18} /> : <UserPlus size={18} />} {editingTeacher ? 'Simpan Perubahan' : 'Simpan Guru'}</button>
          </form>
        </div>
      )}
      {detailTeacher && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDetailTeacher(null)}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title"><h2>Detail Guru</h2><button type="button" onClick={() => setDetailTeacher(null)}><X /></button></div>
            <div style={{ display: 'grid', gap: '16px', margin: '8px 0 16px' }}>
              {[{ label: 'ID Guru', value: formatTeacherId(detailTeacher.id) }, { label: 'Nama Lengkap', value: detailTeacher.name }, { label: 'Email', value: detailTeacher.email || '-' }, { label: 'Nomor HP', value: detailTeacher.phone || '-' }, { label: 'Peran', value: detailTeacher.role }, { label: 'Status', value: detailTeacher.meta, color: detailTeacher.meta === 'Aktif' ? '#0ba875' : undefined }].map((f) => (
                <div key={f.label}><small style={{ display: 'block', color: '#717a8c', fontSize: '11px', marginBottom: '3px' }}>{f.label}</small><strong style={{ fontSize: '15px', color: f.color || 'inherit' }}>{f.value}</strong></div>
              ))}
            </div>
            <button className="primary-button" type="button" onClick={() => { setDetailTeacher(null); openEditForm(detailTeacher) }}><Pencil size={18} /> Ubah Data Guru</button>
          </div>
        </div>
      )}
    </div>
  )
}
