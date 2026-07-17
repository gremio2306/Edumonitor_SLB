import { BellRing, CircleHelp, Globe2, Info, LockKeyhole, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { auth, logout } = useAuth()
  const { settings, toggleLanguage, toggleNotifications, togglePrivacy, showToast } = useApp()
  const exit = () => { logout(); navigate('/login', { replace: true }) }
  return (
    <div className="page padded-page settings-page">
      <Header title="Pengaturan" />
      <Card className="settings-profile"><div><strong>{auth?.name}</strong><p>{auth?.title} • SD Inklusi</p></div><button onClick={()=>showToast('Form edit profil dibuka','info')}>Edit Profil</button></Card>
      <h3 className="settings-section-title">PREFERENSI APLIKASI</h3>
      <Card className="settings-list">
        <button onClick={toggleLanguage}><span className="setting-icon blue"><Globe2/></span><div><strong>Bahasa</strong><small>{settings.language}</small></div><span className="setting-icon blue" style={{marginLeft:'auto'}}><Globe2 size={16}/></span></button>
        <button onClick={toggleNotifications}><span className="setting-icon purple"><BellRing/></span><div><strong>Notifikasi</strong><small>{settings.notifications?'Aktif':'Nonaktif'}</small></div><span className={`toggle ${settings.notifications?'on':''}`}><i/></span></button>
        <button onClick={togglePrivacy}><span className="setting-icon peach"><LockKeyhole/></span><div><strong>Privasi</strong><small>{settings.privacy?'Keamanan data siswa aktif':'Perlindungan dasar'}</small></div><span className={`toggle ${settings.privacy?'on':''}`}><i/></span></button>
      </Card>
      <h3 className="settings-section-title">DUKUNGAN & INFORMASI</h3>
      <Card className="settings-list"><button onClick={()=>showToast('Bantuan dibuka','info')}><span className="setting-icon gray"><CircleHelp/></span><div><strong>Bantuan</strong><small>FAQ dan panduan penggunaan</small></div><span className="setting-icon gray"><CircleHelp size={16}/></span></button><button onClick={()=>showToast('EduMonitor versi 1.4.2','info')}><span className="setting-icon gray"><Info/></span><div><strong>Tentang Aplikasi</strong><small>Versi 1.4.2</small></div><span className="setting-icon gray"><Info size={16}/></span></button></Card>
      <button className="logout-outline" onClick={exit}><LogOut/> Keluar dari Akun</button>
    </div>
  )
}
