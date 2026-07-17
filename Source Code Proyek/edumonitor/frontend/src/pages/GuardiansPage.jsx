import { ArrowDownUp, Eye, MapPin, MoreVertical, Pencil, Phone, Plus, SlidersHorizontal, Trash2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, Chip, SearchBox } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useSearchFilter } from '../hooks/useSearchFilter'
import { formatGuardianId, getFallbackPath } from '../utils/helpers'

const relationFilters = ['Semua', 'Ayah', 'Ibu', 'Kakek', 'Nenek', 'Saudara']
const initialForm = { name: '', relation: 'Ayah', studentId: '', address: '', phone: '' }

function getChildName(guardian, students) {
  if (guardian.studentId) {
    const student = students.find((s) => s.id === guardian.studentId)
    if (student) return student.name
  }
  return guardian.child || '-'
}

export default function GuardiansPage() {
  const { auth } = useAuth()
  const { guardians, students, addGuardian, updateGuardian, deleteGuardian, showToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingGuardian, setEditingGuardian] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [detailGuardian, setDetailGuardian] = useState(null)

  const enrichGuardians = guardians.map((g) => ({ ...g, childName: getChildName(g, students) }))

  const { query, setQuery, filter, setFilter, sortBy, setSortBy, sortDir, setSortDir, data } = useSearchFilter(enrichGuardians, {
    fields: ['id', 'name', 'childName', 'relation', 'address', 'phone'],
    filterKey: 'relation',
    filterOptions: relationFilters,
    defaultField: 'name',
  })

  if (auth?.role !== 'admin') return <Navigate to={getFallbackPath(auth?.role)} replace />

  const closeForm = () => { setShowForm(false); setEditingGuardian(null); setForm(initialForm) }

  const openAddForm = () => { setEditingGuardian(null); setForm(initialForm); setActiveMenuId(null); setShowForm(true) }

  const openEditForm = (guardian) => {
    setEditingGuardian(guardian)
    setForm({ name: guardian.name || '', relation: guardian.relation || 'Ayah', studentId: guardian.studentId || '', address: guardian.address || '', phone: guardian.phone || '' })
    setActiveMenuId(null)
    setShowForm(true)
  }

  const submitGuardian = (e) => {
    e.preventDefault()
    const payload = { name: form.name.trim(), relation: form.relation, studentId: form.studentId || null, address: form.address.trim(), phone: form.phone.trim() }
    if (!payload.name || !payload.address || !payload.phone) { showToast('Nama, alamat, dan nomor HP wajib diisi', 'error'); return }
    if (payload.studentId) {
      const linkedStudent = students.find((s) => s.id === payload.studentId)
      payload.child = linkedStudent ? linkedStudent.name : ''
    } else { payload.child = '' }
    if (editingGuardian) { updateGuardian(editingGuardian.id, payload) } else { addGuardian(payload) }
    closeForm()
  }

  const removeGuardian = (guardian) => { if (window.confirm(`Hapus data wali murid "${guardian.name}"?`)) { deleteGuardian(guardian.id); setActiveMenuId(null) } }

  const callGuardian = (guardian) => { window.location.href = `tel:${String(guardian.phone).replace(/[^\d+]/g, '')}` }

  return (
    <div className="page padded-page guardians-page">
      <Header />
      <div className="title-with-button guardians-page-heading">
        <div><h1>Wali Murid</h1><p>Kelola informasi kontak dan hubungan keluarga siswa.</p></div>
        <button type="button" className="small-primary guardian-add-button" onClick={openAddForm}><UserPlus size={18} /> Tambah Wali</button>
      </div>
      <div className="search-filter-row">
        <SearchBox value={query} onChange={setQuery} placeholder="Cari ID, nama wali, atau siswa..." />
        <button type="button" className="filter-button" onClick={() => showToast('Pencarian mencakup ID, nama, siswa, alamat, dan nomor HP', 'info')}><SlidersHorizontal /></button>
      </div>
      <div className="horizontal-chips">{relationFilters.map((item) => <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Chip>)}</div>
      <div className="sort-control-row">
        <ArrowDownUp size={15} /><span>Urutkan</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="name">Nama</option><option value="relation">Hubungan</option></select>
        <button className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>{sortDir === 'asc' ? '↑' : '↓'}</button>
      </div>
      <div className="stack guardian-stack">
        {data.length > 0 ? data.map((guardian) => (
          <Card key={guardian.id} className="guardian-card">
            <div className="guardian-head">
              <Avatar initials={guardian.initials} size={56} />
              <div className="master-card-copy">
                <strong>{guardian.name}</strong>
                <small className="master-id-label">ID Wali: {formatGuardianId(guardian.id)}</small>
                <small><span className="relation-badge">{guardian.relation}</span>{guardian.childName !== '-' && `Wali dari: ${guardian.childName}`}</small>
              </div>
              <div className="guardian-contact-actions">
                <button type="button" className="call-button" onClick={() => callGuardian(guardian)}><Phone size={20} /></button>
                <div className="master-card-actions">
                  <button type="button" className="icon-button" onClick={() => setActiveMenuId(activeMenuId === guardian.id ? null : guardian.id)}><MoreVertical /></button>
                  {activeMenuId === guardian.id && (
                    <div className="master-action-menu">
                      <button type="button" onClick={() => { setDetailGuardian(guardian); setActiveMenuId(null) }}><Eye size={16} /> Detail</button>
                      <button type="button" onClick={() => openEditForm(guardian)}><Pencil size={16} /> Ubah</button>
                      <button type="button" className="danger" onClick={() => removeGuardian(guardian)}><Trash2 size={16} /> Hapus</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="divider" />
            <p><MapPin size={19} /><span>{guardian.address}</span></p>
            <p><Phone size={19} /><span>{guardian.phone}</span></p>
          </Card>
        )) : <div className="empty-state card"><strong>Wali murid tidak ditemukan</strong><span>Gunakan nama, ID, siswa, alamat, atau nomor HP yang berbeda.</span></div>}
      </div>
      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeForm}>
          <form className="modal-card" onSubmit={submitGuardian} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title"><h2>{editingGuardian ? 'Ubah Wali Murid' : 'Tambah Wali Murid'}</h2><button type="button" onClick={closeForm}><X /></button></div>
            {editingGuardian && <label>ID Wali<input type="text" value={formatGuardianId(editingGuardian.id)} disabled /></label>}
            <label>Nama wali<input required autoFocus value={form.name} placeholder="Masukkan nama wali" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
            <label>Hubungan<select value={form.relation} onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}><option value="Ayah">Ayah</option><option value="Ibu">Ibu</option><option value="Kakek">Kakek</option><option value="Nenek">Nenek</option><option value="Saudara">Saudara</option></select></label>
            <label>Siswa<select value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}><option value="">-- Pilih siswa --</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.className}</option>)}</select></label>
            <label>Alamat<textarea required rows={4} value={form.address} placeholder="Masukkan alamat lengkap" onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></label>
            <label>Nomor HP<input type="tel" required value={form.phone} placeholder="Contoh: 0812-3456-7890" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></label>
            <button className="primary-button" type="submit">{editingGuardian ? <Pencil size={18} /> : <Plus size={18} />} {editingGuardian ? 'Simpan Perubahan' : 'Simpan Wali Murid'}</button>
          </form>
        </div>
      )}
      {detailGuardian && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDetailGuardian(null)}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title"><h2>Detail Wali Murid</h2><button type="button" onClick={() => setDetailGuardian(null)}><X /></button></div>
            <div style={{ display: 'grid', gap: '16px', margin: '8px 0 16px' }}>
              {[{ label: 'ID Wali', value: formatGuardianId(detailGuardian.id) }, { label: 'Nama Lengkap', value: detailGuardian.name }, { label: 'Hubungan', value: detailGuardian.relation }, { label: 'Siswa', value: getChildName(detailGuardian, students) }, { label: 'Alamat', value: detailGuardian.address }, { label: 'Nomor HP', value: detailGuardian.phone }].map((f) => (
                <div key={f.label}><small style={{ display: 'block', color: '#717a8c', fontSize: '11px', marginBottom: '3px' }}>{f.label}</small><strong style={{ fontSize: '15px' }}>{f.value}</strong></div>
              ))}
            </div>
            <button className="primary-button" type="button" onClick={() => { setDetailGuardian(null); openEditForm(detailGuardian) }}><Pencil size={18} /> Ubah Data Wali</button>
          </div>
        </div>
      )}
    </div>
  )
}
