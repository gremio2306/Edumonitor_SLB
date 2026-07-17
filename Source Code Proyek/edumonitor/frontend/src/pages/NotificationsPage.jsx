import { AlertTriangle, ArrowUpRight, BellRing, Check, Megaphone, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import Header from '../components/Header'
import { Card } from '../components/UI'
import { useApp } from '../context/AppContext'

const icons = { danger: AlertTriangle, progress: ArrowUpRight, info: Megaphone, note: MessageCircle }

export default function NotificationsPage() {
  const { notifications, markNotificationDone, showToast } = useApp()
  const [tab, setTab] = useState('all')
  const data = useMemo(() => tab === 'unread' ? notifications.filter((n) => n.unread) : notifications, [notifications, tab])
  return (
    <div className="page padded-page notifications-page">
      <Header title="Notifikasi" back />
      <div className="notification-tabs"><button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>Semua</button><button className={tab==='unread'?'active':''} onClick={()=>setTab('unread')}>Belum Dibaca</button></div>
      <h3 className="date-section">HARI INI</h3>
      <div className="stack">
        {data.map((item) => { const Icon = icons[item.type] || BellRing; return (
          <Card key={item.id} className={`notification-card ${item.type} ${item.unread?'unread':''}`}>
            <span className={`notification-type-icon ${item.type}`}><Icon /></span>
            <div><div className="notification-title"><strong>{item.title}</strong><time>{item.time}</time></div><p>{item.body}</p>{item.type==='progress'&&<div className="notification-progress"><span>Progress Terkini <b>85%</b></span><div><i /></div></div>}{item.unread&&<div className="inline-actions"><button onClick={()=>showToast('Lokasi siswa dibuka','info')}>{item.type==='danger'?'Lacak Lokasi':'Buka Detail'}</button><button onClick={()=>markNotificationDone(item.id)}><Check size={15}/> Selesaikan</button></div>}</div>
          </Card>
        )})}
      </div>
    </div>
  )
}
