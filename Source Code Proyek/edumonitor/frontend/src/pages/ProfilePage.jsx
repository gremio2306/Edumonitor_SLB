import { FileText, HelpCircle, LogOut, Mail, MapPin, Pencil, Phone, Settings, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Avatar, Card, ListRow } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import profileImage from '../assets/profile-sarah.png'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { auth, logout } = useAuth()
  const { showToast } = useApp()
  const exit = () => { logout(); navigate('/login', { replace: true }) }
  return (
    <div className="page padded-page profile-page">
      <Header title="EduMonitor" />
      <div className="profile-hero"><div className="profile-photo"><Avatar image={profileImage} initials={auth?.initials} size={126}/><button onClick={()=>showToast('Mode edit foto profil aktif','info')}><Pencil size={17}/></button></div><h1>{auth?.name || 'Sarah Mitchell'}</h1><span>{auth?.title || 'Lead IEP Coordinator'}</span></div>
      <Card className="profile-info-card"><h3>INFORMASI PRIBADI</h3><ListRow icon={<Mail/>} title="Email" subtitle={auth?.email || 'sarah.mitchell@edumonitor.com'} onClick={()=>showToast('Alamat email disalin','info')}/><ListRow icon={<Phone/>} title="Nomor Telepon" subtitle="+62 812 3456 7890"/><ListRow icon={<MapPin/>} title="Lokasi Kerja" subtitle="Pusat Terapi ABC, Jakarta"/></Card>
      <Card className="profile-info-card"><h3>PENGATURAN & DUKUNGAN</h3><ListRow icon={<Settings/>} title="Pengaturan Aplikasi" onClick={()=>navigate('/settings')}/><ListRow icon={<HelpCircle/>} title="Pusat Bantuan" onClick={()=>showToast('Pusat bantuan dibuka','info')}/><ListRow icon={<FileText/>} title="Syarat & Ketentuan" onClick={()=>showToast('Syarat dan ketentuan dibuka','info')}/><ListRow icon={<UserRound/>} title="Ganti Peran Demo" onClick={()=>navigate('/settings')}/></Card>
      <button className="logout-button" onClick={exit}><LogOut/> Keluar</button><small className="app-version">Versi Aplikasi 2.4.0 (Build 89)</small>
    </div>
  )
}
