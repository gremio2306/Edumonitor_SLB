import { ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <main className="login-page edu-login-page">
      <section className="edu-login-shell">
        <aside className="edu-login-visual" />
        <section className="edu-login-form-panel">
          <div className="edu-login-form-content" style={{ textAlign: 'center' }}>
            <div style={{ margin: '2rem 0' }}>
              <ShieldX size={64} strokeWidth={1.5} />
            </div>
            <h2>Akses Ditolak</h2>
            <p>Anda tidak memiliki akses ke halaman ini.</p>
            <button
              type="button"
              className="edu-login-submit"
              onClick={() => navigate('/home')}
              style={{ marginTop: '1.5rem' }}
            >
              Kembali ke Dashboard
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}
