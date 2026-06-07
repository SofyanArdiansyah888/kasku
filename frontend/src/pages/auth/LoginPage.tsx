import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Mail, Lock, Wallet } from 'lucide-react'
import { loginSchema } from '../../schemas/auth.schema'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    const result = loginSchema.safeParse({ email, password })
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
      await login(email, password)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setErrors({ root: err instanceof Error ? err.message : 'Login gagal' })
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
          <div className="auth-tagline">Catatan Keuangan Pribadi</div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <Mail size={17} className="input-icon" />
              <input
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          {errors.root && (
            <div style={{ padding: '10px 14px', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: 13, fontWeight: 700 }}>
              {errors.root}
            </div>
          )}
          <button type="submit" className="submit-btn" disabled={isPending} style={{ marginTop: 8 }}>
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="auth-footer-link">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  )
}
