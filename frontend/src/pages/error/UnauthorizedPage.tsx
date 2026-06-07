import { useNavigate, useRouter } from '@tanstack/react-router'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { pengguna, isAuthenticated } = useAuth()

  const goBack = () => {
    if (window.history.length > 1) {
      router.history.back()
    } else {
      navigate({ to: isAuthenticated ? '/dashboard' : '/login' })
    }
  }

  return (
    <div className="error-page">
      <div className="error-glow-accent" />
      <div className="error-glow-2" />
      <div className="auth-dots" />

      <div className="error-card">
        <div
          className="error-icon-wrap"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}
        >
          <ShieldX size={32} color="var(--color-accent)" />
        </div>
        <div className="error-code" style={{ color: 'var(--color-accent)' }}>403</div>
        <h1 className="error-title">
          Akses <span style={{ color: 'var(--color-accent)' }}>Ditolak</span>
        </h1>
        <p className="error-desc">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>

        {isAuthenticated && pengguna && (
          <div className="error-user-info">
            <div className="error-user-avatar">
              {pengguna.nama
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13 }}>{pengguna.nama}</div>
            </div>
          </div>
        )}

        <div style={{ width: '100%', height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

        <div className="error-actions">
          <button className="error-btn-secondary" onClick={goBack}>
            <ArrowLeft size={16} /> Kembali
          </button>
          <button
            className="error-btn-primary"
            onClick={() => navigate({ to: isAuthenticated ? '/dashboard' : '/login' })}
          >
            <Home size={16} />
            {isAuthenticated ? 'Ke Dashboard' : 'Ke Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
