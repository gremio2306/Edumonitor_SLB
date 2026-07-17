import { ChevronRight, Search } from 'lucide-react'

export function Avatar({ initials = 'EM', size = 40, image, className = '' }) {
  return (
    <div className={`avatar ${className}`} style={{ width: size, height: size }}>
      {image ? <img src={image} alt="" /> : <span>{initials}</span>}
    </div>
  )
}

export function Card({ children, className = '', onClick }) {
  return <div className={`card ${className}`} onClick={onClick}>{children}</div>
}

export function SectionTitle({ title, action, onAction }) {
  return (
    <div className="section-title-row">
      <h2>{title}</h2>
      {action && <button className="link-button" onClick={onAction}>{action}</button>}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <label className="search-box">
      <Search size={20} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  )
}

export function Chip({ active, children, onClick, className = '' }) {
  return <button className={`chip ${active ? 'active' : ''} ${className}`} onClick={onClick}>{children}</button>
}

export function ProgressBar({ value = 0, tone = 'blue' }) {
  return (
    <div className="progress-track">
      <div className={`progress-value ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function ListRow({ icon, title, subtitle, onClick, trailing = true }) {
  return (
    <button className="list-row" onClick={onClick}>
      <span className="list-row-icon">{icon}</span>
      <span className="list-row-text"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>
      {trailing && <ChevronRight size={19} />}
    </button>
  )
}

export function EmptyState({ title = 'Belum ada data', description = 'Data akan muncul di sini.' }) {
  return <div className="empty-state"><strong>{title}</strong><span>{description}</span></div>
}
