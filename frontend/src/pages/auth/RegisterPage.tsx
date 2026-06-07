import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { User, Mail, Lock, Wallet } from 'lucide-react'
import { registerSchema } from '../../schemas/auth.schema'
import { useAuth } from '../../contexts/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = registerSchema.safeParse({ name, email, password, confirmPassword })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsPending(true)
    try {
      await register(name, email, password)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setErrors({ root: err instanceof Error ? err.message : 'Pendaftaran gagal' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />
      <div className="auth-dots" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-icon">
            <Wallet size={28} color="var(--color-accent)" />
          </div>
          <div className="auth-brand">
            KAS<span style={{ color: 'var(--color-accent)' }}>KU</span>
          </div>
          <div className="auth-tagline">Buat akun baru</div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <div className="input-wrap">
              <User size={17} className="input-icon" />
              <input
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <Mail size={17} className="input-icon" />
              <input
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="email@core.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isPending}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div className="input-wrap">
              <Lock size={17} className="input-icon" />
              <input
                type="password"
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Min. 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isPending}
              />
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Kata Sandi</label>
            <div className="input-wrap">
              <Lock size={17} className="input-icon" />
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Ulangi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isPending}
              />
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.root && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--color-danger-bg)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {errors.root}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isPending}
            style={{ marginTop: 8 }}
          >
            {isPending && <span className="spinner" />}
            {isPending ? 'Memproses...' : 'Buat Akun'}
          </button>
        </form>

        <div className="auth-footer-link">
          Sudah punya akun?{' '}
          <Link to="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  )
}
