import { useNavigate, useRouter } from '@tanstack/react-router'
import { Home, ArrowLeft, Compass } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function NotFoundPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const goBack = () => {
    if (window.history.length > 1) {
      router.history.back()
    } else {
      navigate({ to: isAuthenticated ? '/dashboard' : '/login' })
    }
  }

  const goHome = () => {
    navigate({ to: isAuthenticated ? '/dashboard' : '/login' })
  }

  return (
    <div className="error-page">
      <div className="error-glow-1" />
      <div className="error-glow-2" />
      <div className="auth-dots" />

      <div className="error-card">
        {/* Icon */}
        <div className="error-icon-wrap">
          <Compass size={32} color="var(--color-accent)" />
        </div>

        {/* Code */}
        <div className="error-code">404</div>

        {/* Title */}
        <h1 className="error-title">
          Halaman Tidak <span style={{ color: 'var(--color-accent)' }}>Ditemukan</span>
        </h1>

        {/* Description */}
        <p className="error-desc">
          URL yang Anda akses tidak tersedia atau sudah dipindahkan. Periksa kembali
          alamat yang Anda masukkan.
        </p>

        {/* URL display */}
        <div className="error-url">
          <span style={{ color: 'var(--color-text-muted)', marginRight: 6 }}>URL:</span>
          <span style={{ color: 'var(--color-accent)', fontFamily: 'monospace' }}>
            {window.location.pathname}
          </span>
        </div>

        {/* Actions */}
        <div className="error-actions">
          <button className="error-btn-secondary" onClick={goBack}>
            <ArrowLeft size={16} />
            Kembali
          </button>
          <button className="error-btn-primary" onClick={goHome}>
            <Home size={16} />
            {isAuthenticated ? 'Ke Dashboard' : 'Ke Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
