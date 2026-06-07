import { useState, type FormEvent, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { userSchema, userRoles, userStatuses } from '../../../schemas/user.schema'
import type { User } from '../../../schemas/user.schema'
import { useCreateUser, useUpdateUser } from '../hooks/useUsers'

interface UserFormProps {
  user: User | null
  onClose: () => void
}

type FieldErrors = Partial<Record<keyof Omit<User, 'id' | 'createdAt'> | 'root', string>>

export function UserForm({ user, onClose }: UserFormProps) {
  const isEdit = !!user
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState(user?.role ?? 'Viewer')
  const [status, setStatus] = useState(user?.status ?? 'Aktif')
  const [errors, setErrors] = useState<FieldErrors>({})

  const isPending = createMutation.isPending || updateMutation.isPending
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const firstInput = containerRef.current?.querySelector<HTMLInputElement>('input, select')
    firstInput?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = userSchema.safeParse({ name, email, role, status })
    if (!result.success) {
      const fe: FieldErrors = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) fe[err.path[0] as keyof FieldErrors] = err.message
      })
      setErrors(fe)
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: user.id, data: result.data })
      } else {
        await createMutation.mutateAsync(result.data)
      }
      onClose()
    } catch (err) {
      setErrors({ root: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <span className="modal-title" id="modal-title">
            {isEdit ? (
              <>
                Edit <span style={{ color: 'var(--color-accent)' }}>Personil</span>
              </>
            ) : (
              <>
                Entri <span style={{ color: 'var(--color-accent)' }}>Baru</span>
              </>
            )}
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Personil</label>
              <input
                type="text"
                className={`form-input no-icon ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Nama lengkap..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <input
                type="email"
                className={`form-input no-icon ${errors.email ? 'is-invalid' : ''}`}
                placeholder="email@core.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Otoritas</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  disabled={isPending}
                >
                  {userRoles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.role && <span className="form-error">{errors.role}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  disabled={isPending}
                >
                  {userStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.status && <span className="form-error">{errors.status}</span>}
              </div>
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
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isPending}
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isPending}
              style={{ flex: 2 }}
            >
              {isPending && <span className="spinner" />}
              {isPending ? 'Menyimpan...' : isEdit ? 'Perbarui Data' : 'Sahkan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
