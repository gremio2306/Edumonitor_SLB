import { useState } from 'react'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  LogIn,
  Mail,
  UserRound,
  Users,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDestination } from '../utils/helpers'
import schoolCampus from '../assets/school-campus.png'

const roleOptions = [
  { value: 'teacher', label: 'Guru' },
  { value: 'guardian', label: 'Wali Murid' },
  { value: 'security', label: 'Petugas Keamanan' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { auth, register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('teacher')
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
    const cleanName = name.trim()

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError('Semua field harus diisi')
      return
    }

    if (!cleanEmail.includes('@')) {
      setError('Masukkan alamat email yang valid')
      return
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok')
      return
    }

    setSubmitting(true)

    try {
      const user = await register({
        name: cleanName,
        email: cleanEmail,
        password,
        role,
      })

      if (user) {
        navigate(getDestination(user.role), { replace: true })
      } else {
        setError('Pendaftaran gagal. Silakan coba lagi.')
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
              <span className="edu-login-brand-icon"><GraduationCap size={28} strokeWidth={2.2} /></span>
              <div><strong>EduMonitor</strong><small>School Monitoring System</small></div>
            </header>
            <div className="edu-login-message">
              <span className="edu-login-eyebrow">Portal Sekolah Inklusif</span>
              <h1>Pendampingan siswa yang lebih terhubung.</h1>
              <p>Pantau perkembangan, aktivitas, keamanan, dan komunikasi sekolah dalam satu sistem yang mudah digunakan.</p>
              <div className="edu-login-benefits">
                <div><span><GraduationCap size={19} /></span><div><strong>Data perkembangan</strong><small>Ringkasan kemajuan siswa yang terstruktur.</small></div></div>
                <div><span><Users size={19} /></span><div><strong>Kolaborasi terintegrasi</strong><small>Hubungkan guru, admin, dan wali murid.</small></div></div>
                <div><span><CheckCircle2 size={19} /></span><div><strong>Keamanan sekolah</strong><small>Pantauan dan respons keadaan darurat.</small></div></div>
              </div>
            </div>
            <footer className="edu-login-visual-footer">
              <span><CheckCircle2 size={16} /> Sistem aktif</span>
              <span>Data sekolah terlindungi</span>
            </footer>
          </div>
        </aside>

        <section className="edu-login-form-panel">
          <div className="edu-login-form-content">
            <header className="edu-login-mobile-brand">
              <span><GraduationCap size={23} /></span>
              <strong>EduMonitor</strong>
            </header>

            <div className="edu-login-form-heading">
              <span className="edu-login-eyebrow blue">Buat akun</span>
              <h2>Daftar Akun Baru</h2>
              <p>Isi data diri untuk membuat akun EduMonitor.</p>
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
                <span>Nama Lengkap</span>
                <div className="edu-login-input">
                  <UserRound size={19} strokeWidth={2} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama lengkap" autoComplete="name" required />
                </div>
              </label>

              <label className="edu-login-field">
                <span>Email</span>
                <div className="edu-login-input">
                  <Mail size={19} strokeWidth={2} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required />
                </div>
              </label>

              <label className="edu-login-field">
                <span>Kata Sandi</span>
                <div className="edu-login-input">
                  <LockKeyhole size={19} strokeWidth={2} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete="new-password" required />
                  <button type="button" className="edu-password-toggle" onClick={() => setShowPassword((c) => !c)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>

              <label className="edu-login-field">
                <span>Konfirmasi Kata Sandi</span>
                <div className="edu-login-input">
                  <LockKeyhole size={19} strokeWidth={2} />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi kata sandi" autoComplete="new-password" required />
                </div>
              </label>

              <label className="edu-login-field">
                <span>Daftar sebagai</span>
                <div className="edu-login-input edu-login-select">
                  <Users size={19} strokeWidth={2} />
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    {roleOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </label>

              <button type="submit" className="edu-login-submit" disabled={submitting}>
                {submitting ? (
                  <><span className="edu-login-loader" /> Mendaftarkan...</>
                ) : (
                  <><LogIn size={19} /> Buat Akun</>
                )}
              </button>
            </form>

            <footer className="edu-login-footer">
              <p>
                Sudah memiliki akun?
                <Link to="/login">Masuk di sini</Link>
              </p>
              <small>&copy; 2026 EduMonitor &middot; Versi 1.0.4</small>
            </footer>
          </div>
        </section>
      </section>
    </main>
  )
}
