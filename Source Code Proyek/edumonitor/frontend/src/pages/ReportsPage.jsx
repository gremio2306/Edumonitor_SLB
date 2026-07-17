import { ArrowDownUp, ArrowUpRight, Award, Brain, Hand, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card, Chip, ProgressBar, SectionTitle } from '../components/UI'
import { useApp } from '../context/AppContext'
import { daysInPeriod } from '../utils/helpers'

const periods = ['Mingguan', 'Bulanan', 'Semester']

function TrendChart() {
  return (
    <svg className="trend-chart" viewBox="0 0 320 130" role="img" aria-label="Grafik tren akademik">
      <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f35e7" stopOpacity=".24"/><stop offset="1" stopColor="#6f35e7" stopOpacity="0"/></linearGradient></defs>
      <path d="M12 105 C55 88 75 96 105 68 S160 82 190 48 S245 55 305 18 L305 120 L12 120 Z" fill="url(#area)" />
      <path d="M12 105 C55 88 75 96 105 68 S160 82 190 48 S245 55 305 18" fill="none" stroke="#6f35e7" strokeWidth="5" strokeLinecap="round" />
      {[12, 105, 190, 305].map((x, i) => <circle key={x} cx={x} cy={[105, 68, 48, 18][i]} r="5" fill="#fff" stroke="#6f35e7" strokeWidth="3" />)}
    </svg>
  )
}

function avgScore(items, filterFn) {
  const matched = items.filter(filterFn)
  return matched.length > 0 ? Math.round(matched.reduce((s, r) => s + (r.score || 0), 0) / matched.length) : 0
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { reports } = useApp()
  const [period, setPeriod] = useState('Bulanan')
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysInPeriod(period))

  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase()
    return reports
      .filter((r) => {
        if (r.date < cutoff.toISOString().slice(0, 10)) return false
        if (!kw) return true
        return [r.student, r.category, r.note, r.author].join(' ').toLowerCase().includes(kw)
      })
      .sort((a, b) => {
        const dA = a.date || ''
        const dB = b.date || ''
        return sortDir === 'desc' ? dB.localeCompare(dA) : dA.localeCompare(dB)
      })
  }, [reports, cutoff, query, sortDir])

  const highCount = filtered.filter((r) => (r.score || 0) >= 80).length

  return (
    <div className="page padded-page reports-page">
      <Header />
      <h1 className="page-heading">Laporan Perkembangan</h1>
      <p className="page-subtitle">Ringkasan kemajuan siswa periode ini.</p>
      <div className="horizontal-chips">{periods.map((item) => <Chip key={item} active={period === item} onClick={() => setPeriod(item)}>{item}</Chip>)}</div>
      <Card className="trend-card"><div><h2>Tren Akademik</h2><p>Kemajuan kurikulum rutin</p></div><ArrowUpRight className="text-blue" /><TrendChart /><div className="chart-days"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span></div></Card>
      <div className="two-column-cards">
        <Card className="metric-card"><span className="soft-icon peach"><Users /></span><strong>Rata-rata Perkembangan</strong><b>{avgScore(filtered, () => true)}%</b><small>Dari {filtered.length} laporan</small></Card>
        <Card className="metric-card"><span className="soft-icon purple"><Award /></span><strong>Pencapaian</strong><b>{highCount}</b><small>Skor ≥ 80</small></Card>
      </div>
      <SectionTitle title="Kategori Perkembangan" />
      <div className="stack category-progress">
        {[{ label: 'Kognitif', icon: Brain, tone: 'purple' }, { label: 'Motorik', icon: Hand, tone: 'orange' }, { label: 'Kemandirian', icon: Users, tone: 'blue' }].map((cat) => {
          const Icon = cat.icon
          const val = avgScore(filtered, (r) => r.category?.toLowerCase().includes(cat.label.toLowerCase()))
          return (
            <Card key={cat.label}>
              <div><Icon /><span>{cat.label}</span><b>{val > 0 ? `${val}%` : '-'}</b></div>
              <ProgressBar value={val} tone={cat.tone} />
            </Card>
          )
        })}
      </div>
      <SectionTitle title="Pencapaian Terbaru" action="Lihat Semua" onAction={() => navigate('/history')} />
      <div className="search-filter-row" style={{ margin: '8px 0' }}>
        <label className="search-box" style={{ flex: 1 }}><Search size={18} /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari laporan..." /></label>
        <div className="sort-control-row" style={{ margin: 0 }}>
          <ArrowDownUp size={15} /><span>Tanggal</span>
          <button className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>{sortDir === 'desc' ? 'Terbaru ↑' : 'Terlama ↑'}</button>
        </div>
      </div>
      <div className="achievement-list">
        {filtered.length > 0 ? filtered.slice(0, 10).map((item) => (
          <button key={item.id} onClick={() => navigate(`/student/${item.studentId}`)}>
            <span className="achievement-dot" />
            <div>
              <strong>{(item.note || '').slice(0, 38)}{(item.note || '').length > 38 ? '...' : ''}</strong>
              <small>{item.date} • {item.student} • Oleh {item.author}</small>
            </div>
          </button>
        )) : <div className="empty-state" style={{ padding: '20px 0' }}><strong>Tidak ada laporan</strong><span>Tidak ada data untuk periode ini.</span></div>}
      </div>
    </div>
  )
}
