import { ArrowDownUp, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card } from '../components/UI'
import { supabase } from '../config/supabase'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const toneByCategory = {
  'Interaksi Sosial': 'blue',
  'Kemampuan Kognitif': 'purple',
  'Regulasi Emosi': 'red',
  'Motorik Halus': 'orange',
}

function getTone(report) {
  return toneByCategory[report.category] || 'blue'
}

function makeInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useApp()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [childStudents, setChildStudents] = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    async function fetchChildren() {
      if (!supabase || !user) {
        setLoading(false)
        return
      }

      console.log('[HistoryPage] user:', user)
      setError(null)
      setLoading(true)

      if (user.role !== 'guardian') {
        console.log('[HistoryPage] Not a guardian role, showing empty')
        setChildStudents([])
        setLoading(false)
        return
      }

      const { data: guardian, error: gErr } = await supabase
        .from('guardians')
        .select('id, name')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('[HistoryPage] guardian row:', guardian, gErr)

      if (gErr) {
        console.error('[HistoryPage] Guardian query error:', gErr.message)
        showToast(gErr.message, 'error')
        setLoading(false)
        return
      }

      if (!guardian) {
        console.log('[HistoryPage] No guardian record for this user')
        setError('Data wali murid tidak ditemukan.')
        setLoading(false)
        return
      }

      const { data: gsList, error: gsErr } = await supabase
        .from('guardian_students')
        .select('student_id')
        .eq('guardian_id', guardian.id)

      console.log('[HistoryPage] guardian_students:', gsList, gsErr)

      if (gsErr) {
        console.error('[HistoryPage] Guardian_students error:', gsErr.message)
        showToast(gsErr.message, 'error')
        setLoading(false)
        return
      }

      if (!gsList || gsList.length === 0) {
        console.log('[HistoryPage] No children linked to this guardian')
        setError('Belum ada data siswa yang terhubung.')
        setLoading(false)
        return
      }

      const studentIds = gsList.map((gs) => gs.student_id)

      const { data: students, error: sErr } = await supabase
        .from('students')
        .select('id, name, class_id, category')
        .in('id', studentIds)
        .order('name')

      console.log('[HistoryPage] students:', students, sErr)

      if (sErr) {
        console.error('[HistoryPage] Students query error:', sErr.message)
        showToast(sErr.message, 'error')
        setLoading(false)
        return
      }

      if (!students || students.length === 0) {
        console.log('[HistoryPage] No student records found')
        setError('Data siswa tidak ditemukan.')
        setLoading(false)
        return
      }

      const classIds = [...new Set(students.map((s) => s.class_id).filter(Boolean))]
      const { data: classes, error: cErr } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds.length > 0 ? classIds : [0])

      console.log('[HistoryPage] classes:', classes, cErr)

      const classMap = {}
      if (!cErr && classes) {
        classes.forEach((c) => { classMap[c.id] = c.name })
      }

      const enriched = students.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        className: classMap[s.class_id] || '',
        initials: makeInitials(s.name),
      }))

      setChildStudents(enriched)
      setSelectedChildId(String(enriched[0].id))
      setError(null)
      setLoading(false)
    }

    fetchChildren()
  }, [user, showToast])

  useEffect(() => {
    async function fetchReports() {
      if (!selectedChildId || !supabase) {
        setReports([])
        return
      }

      setReportsLoading(true)

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('student_id', Number(selectedChildId))
        .order('date', { ascending: false })

      console.log('[HistoryPage] reports:', data, error)

      if (error) {
        console.error('[HistoryPage] Reports query error:', error.message)
        showToast(error.message, 'error')
        setReportsLoading(false)
        return
      }

      const mapped = (data || []).map((r) => ({
        id: r.id,
        date: formatDate(r.date),
        title: r.category,
        tags: r.tags || [],
        note: r.note || '',
        tone: getTone(r),
      }))

      setReports(mapped)
      setReportsLoading(false)
    }

    fetchReports()
  }, [selectedChildId, showToast])

  const selectedChild = useMemo(
    () => childStudents.find((s) => String(s.id) === selectedChildId) || null,
    [childStudents, selectedChildId],
  )

  const data = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return reports
      .filter((item) => {
        if (!keyword) return true
        return [item.title, item.note, ...(item.tags || [])].join(' ').toLowerCase().includes(keyword)
      })
      .sort((a, b) => {
        const dA = a.date || ''
        const dB = b.date || ''
        return sortDir === 'desc' ? dB.localeCompare(dA) : dA.localeCompare(dB)
      })
  }, [reports, query, sortDir])

  if (loading) {
    return (
      <div className="page padded-page history-page professional-subpage">
        <div className="history-topbar">
          <Header title="Riwayat Perkembangan" back compact />
        </div>
        <div style={{ padding: '24px', textAlign: 'center', opacity: 0.6 }}>Memuat...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page padded-page history-page professional-subpage">
        <div className="history-topbar">
          <Header title="Riwayat Perkembangan" back compact />
        </div>
        <div style={{ padding: '24px', textAlign: 'center', opacity: 0.6 }}>{error}</div>
      </div>
    )
  }

  return (
    <div className="page padded-page history-page professional-subpage">
      <div className="history-topbar">
        <Header title="Riwayat Perkembangan" back compact />
        <button className="icon-button" onClick={() => setShowSearch((s) => !s)}>{showSearch ? <X /> : <Search />}</button>
      </div>
      {showSearch && (
        <div className="search-filter-row" style={{ marginTop: '8px' }}>
          <label className="search-box"><Search size={18} /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul, catatan, atau tag..." autoFocus /></label>
        </div>
      )}

      {childStudents.length > 1 && (
        <div style={{ marginBottom: '12px' }}>
          <select
            className="form-select"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #dde1e6', fontSize: 14 }}
          >
            {childStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedChild && (
        <Card className="history-student">
          <div className="avatar avatar-peach">{selectedChild.initials}</div>
          <div>
            <strong>{selectedChild.name}</strong>
            <small>{selectedChild.className} • {selectedChild.category}</small>
          </div>
        </Card>
      )}

      <div className="sort-control-row" style={{ marginTop: '12px' }}>
        <ArrowDownUp size={15} /><span>Tanggal</span>
        <button className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>{sortDir === 'desc' ? 'Terbaru ↑' : 'Terlama ↑'}</button>
      </div>

      {reportsLoading ? (
        <div style={{ padding: '24px', textAlign: 'center', opacity: 0.6 }}>Memuat riwayat...</div>
      ) : (
        <div className="history-timeline">
          {data.map((item) => (
            <article key={item.id} className="history-entry">
              <span className={`history-dot ${item.tone}`}>●</span>
              <Card className="history-entry-card">
                <div className="history-date"><strong>{item.date}</strong><ChevronDown size={18} /></div>
                <h3>{item.title}</h3>
                <div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <p>{item.note}</p>
              </Card>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
