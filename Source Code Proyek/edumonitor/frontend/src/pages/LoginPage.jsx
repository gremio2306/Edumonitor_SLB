import { useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDestination } from '../utils/helpers'
import schoolCampus from '../assets/gedung_slb.jpeg'
import schoolLogo from '../assets/logo_slb.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { auth, login } = useAuth()

  const [email, setEmail] = useState('teacher@edumonitor.com')
  const [password, setPassword] = useState('12345678')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (auth) {
    return <Navigate to={getDestination(auth.role)} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const cleanEmail = email.trim()

    if (!cleanEmail.includes('@') || password.length < 4) {
      setError('Masukkan email dan kata sandi yang valid')
      return
    }

    setSubmitting(true)

    try {
      const user = await login(cleanEmail, password)

      if (user) {
        navigate(getDestination(user.role), { replace: true })
      } else {
        setError('Email atau kata sandi tidak ditemukan')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page edu-login-page">
      <section className="edu-login-shell">
        <aside className="edu-login-visual">
          <div className="edu-login-image-wrapper">
            <img className="edu-login-visual-image" src={schoolCampus} alt="Lingkungan sekolah inklusif EduMonitor" />
            <img className="edu-login-children-layer" src={schoolCampus} alt="" aria-hidden="true" />
            <div className="edu-login-child-light child-light-one" aria-hidden="true" />
            <div className="edu-login-child-light child-light-two" aria-hidden="true" />
          </div>
          <div className="edu-login-visual-overlay" />
          <div className="edu-login-visual-content">
            <header className="edu-login-brand">
              <img src={schoolLogo} alt="Logo Sekolah" className="edu-login-school-logo" style={{width:80,height:80}} />
              <div>
                <strong style={{fontSize:'2rem'}}>EduMonitor</strong>
                <small style={{display:'block',marginTop:4}}>Sistem Monitoring Sekolah</small>
              </div>
            </header>
            <div className="edu-login-message">
              <span className="edu-login-eyebrow">Portal Sekolah Inklusif</span>
              <h1 style={{fontSize:"2.8rem",lineHeight:1.15,marginBottom:16}}>Selamat Datang di EduMonitor</h1>
              <p style={{fontSize:"1.05rem",lineHeight:1.7,maxWidth:540}}>Sistem Monitoring Sekolah untuk mendukung pembelajaran, keamanan, dan perkembangan peserta didik secara terintegrasi.</p>
              <div className="edu-login-benefits">
                <div><span><BarChart3 size={19} /></span><div><strong>Data perkembangan</strong><small>Ringkasan kemajuan siswa yang terstruktur.</small></div></div>
                <div><span><Users size={19} /></span><div><strong>Kolaborasi terintegrasi</strong><small>Hubungkan guru, admin, dan wali murid.</small></div></div>
                <div><span><ShieldCheck size={19} /></span><div><strong>Keamanan sekolah</strong><small>Pantauan dan respons keadaan darurat.</small></div></div>
              </div>
            </div>
            <footer className="edu-login-visual-footer">
              <span><CheckCircle2 size={16} /> Sekolah Terintegrasi</span>
              <span>Data Aman • Monitoring Real-time</span>
            </footer>
          </div>
        </aside>

        <section className="edu-login-form-panel">
          <div className="edu-login-form-content">
            <header className="edu-login-mobile-brand">
              <img src={schoolLogo} alt="Logo Sekolah" className="edu-login-mobile-logo" />
              <strong>EduMonitor</strong>
            </header>

            <div className="edu-login-form-heading">
              <span className="edu-login-eyebrow blue">Akses akun</span>
              <h2>Selamat datang kembali</h2>
              <p>Masukkan informasi akun untuk melanjutkan ke dashboard EduMonitor.</p>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#c82329',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 16,
              }}>{error}</div>
            )}

            <form className="edu-login-form" onSubmit={submit}>
              <label className="edu-login-field">
                <span>Email</span>
                <div className="edu-login-input">
                  <Mail size={19} strokeWidth={2} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@sekolah.id" autoComplete="email" required />
                </div>
              </label>

              <label className="edu-login-field">
                <span>Kata sandi</span>
                <div className="edu-login-input">
                  <LockKeyhole size={19} strokeWidth={2} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan kata sandi" autoComplete="current-password" required />
                  <button type="button" className="edu-password-toggle" onClick={() => setShowPassword((c) => !c)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>

              <div className="edu-login-options">
                <label className="edu-login-checkbox">
                  <input type="checkbox" defaultChecked />
                  <span>Ingat saya</span>
                </label>
                <button type="button" className="edu-login-text-button" onClick={() => setError('Tautan reset kata sandi telah dikirim')}>
                  Lupa kata sandi?
                </button>
              </div>

              <button type="submit" className="edu-login-submit" disabled={submitting}>
                {submitting ? (
                  <><span className="edu-login-loader" /> Memproses...</>
                ) : (
                  <>Masuk ke EduMonitor <LogIn size={19} /></>
                )}
              </button>
            </form>

            <div className="edu-login-demo">
              <span>Akun demo</span>
              <p>
                Gunakan salah satu akun: <strong>admin@edumonitor.com</strong>, <strong>teacher@edumonitor.com</strong>, <strong>guardian@edumonitor.com</strong>, atau <strong>security@edumonitor.com</strong>. Kata sandi: <strong>12345678</strong>.
              </p>
            </div>

            <footer className="edu-login-footer">
              <p>
                Belum memiliki akun?
                <Link to="/register">Daftar di sini</Link>
              </p>
              <small>&copy; 2026 EduMonitor &middot; Versi 1.0.4</small>
            </footer>
          </div>
        </section>
      </section>
    </main>
  )
}
