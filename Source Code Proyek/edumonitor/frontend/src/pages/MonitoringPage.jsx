import { AlertTriangle, ArrowDownUp, CalendarDays, MoreVertical, Pencil, Plus, Search, Siren, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, Chip, ProgressBar } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { formatDateGroup } from '../utils/helpers'

export default function MonitoringPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { reports, students, deleteReport, showToast } = useApp()
  const [selected, setSelected] = useState('Semua Siswa')
  const [textQuery, setTextQuery] = useState('')
  const [sortDir, setSortDir] = useState('desc')
  const [activeMenuId, setActiveMenuId] = useState(null)

  const filtered = useMemo(
    () => {
      let items = selected === 'Semua Siswa'
        ? reports
        : reports.filter((item) => {
            const student = students.find((s) => s.id === item.studentId)
            return student ? student.id === selected : item.student === selected
          })

      const keyword = textQuery.trim().toLowerCase()
      if (keyword) {
        items = items.filter((r) =>
          [r.student, r.category, r.note, r.author, r.status]
            .join(' ')
            .toLowerCase()
            .includes(keyword),
        )
      }

      return [...items].sort((a, b) => {
        const dateA = a.date || ''
        const dateB = b.date || ''
        return sortDir === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB)
      })
    },
    [reports, students, selected, textQuery, sortDir],
  )

  const grouped = useMemo(
    () =>
      filtered.reduce((acc, item) => {
        const key = formatDateGroup(item.date)
        acc[key] ||= []
        acc[key].push(item)
        return acc
      }, {}),
    [filtered],
  )

  const canManage = auth?.role === 'admin' || auth?.role === 'teacher'

  const removeReport = (report) => {
    const confirmed = window.confirm(`Hapus laporan "${report.category}" untuk ${report.student}?`)
    if (!confirmed) return
    deleteReport(report.id)
    setActiveMenuId(null)
  }

  return (
    <div className="page padded-page monitoring-page professional-subpage">
      <Header title="Monitoring" />
      <div className="horizontal-chips monitoring-filters">
        <Chip active={selected === 'Semua Siswa'} onClick={() => { setSelected('Semua Siswa'); setActiveMenuId(null) }}>Semua Siswa</Chip>
        {students.map((student) => <Chip key={student.id} active={selected === student.id} onClick={() => { setSelected(student.id); setActiveMenuId(null) }}><span className="mini-initial">{student.initials}</span>{student.name.split(' ')[0]}</Chip>)}
      </div>
      <div className="search-filter-row" style={{ margin: '10px 0' }}>
        <label className="search-box" style={{ flex: 1 }}>
          <Search size={18} />
          <input type="search" value={textQuery} onChange={(e) => setTextQuery(e.target.value)} placeholder="Cari catatan, kategori, atau siswa..." />
        </label>
        <div className="sort-control-row" style={{ margin: 0 }}>
          <ArrowDownUp size={15} />
          <span>Tanggal</span>
          <button className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
            {sortDir === 'desc' ? 'Terbaru ↑' : 'Terlama ↑'}
          </button>
        </div>
        {auth?.role === 'teacher' && selected !== 'Semua Siswa' && (
          <button
            type="button"
            className="icon-button danger"
            style={{ marginLeft: 8, background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 600, border: '1px solid #fecaca', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate(`/emergency?studentId=${selected}`)}
            title="Kirim panic alert untuk siswa ini"
          >
            <Siren size={16} />
            Panic
          </button>
        )}
      </div>

      <div className="timeline">
        {Object.entries(grouped).map(([date, items]) => (
          <section key={date} className="timeline-group">
            <div className="timeline-date"><span><CalendarDays size={18} /></span><strong>{date}</strong></div>
            <div className="timeline-items">
              {items.map((report) => (
                <Card key={report.id} className="timeline-card" onClick={() => navigate(`/student/${report.studentId}`)}>
                  <div className="report-title-row">
                    <Avatar initials={report.student?.split(' ').map((x) => x[0]).join('').slice(0, 2)} size={42} />
                    <div><strong>{report.student}</strong><small>Kategori: {report.category}</small></div>
                    <span className={`status-badge status-${report.status?.toLowerCase()}`}>{report.status}</span>
                    {canManage && (
                      <div className="master-card-actions" style={{ position: 'relative', marginLeft: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="icon-button" onClick={() => setActiveMenuId(activeMenuId === report.id ? null : report.id)}>
                          <MoreVertical size={16} />
                        </button>
                        {activeMenuId === report.id && (
                          <div className="master-action-menu" style={{ right: 'auto', left: '0' }}>
                            <button type="button" onClick={() => { setActiveMenuId(null); navigate(`/progress/new?edit=${report.id}`) }}>
                              <Pencil size={16} /> Edit
                            </button>
                            <button type="button" className="danger" onClick={() => removeReport(report)}>
                              <Trash2 size={16} /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p>{report.note}</p>
                  <div className="progress-with-label"><ProgressBar value={report.score} tone={report.score < 40 ? 'red' : 'purple'} /><b>{report.score}% Target</b></div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      {canManage && <button className="fab" onClick={() => navigate('/progress/new')}><Plus /></button>}
    </div>
  )
}
