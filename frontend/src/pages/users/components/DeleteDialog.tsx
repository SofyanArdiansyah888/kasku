import { useRef, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { User } from '../../../schemas/user.schema'
import { useDeleteUser } from '../hooks/useUsers'

interface DeleteDialogProps {
  user: User
  onClose: () => void
}

export function DeleteDialog({ user, onClose }: DeleteDialogProps) {
  const deleteMutation = useDeleteUser()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id)
      onClose()
    } catch {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
      >
        <div className="modal-header">
          <span className="modal-title" id="delete-title">
            Hapus <span style={{ color: 'var(--color-accent)' }}>Pengguna</span>
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" id="delete-desc">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '16px',
              background: 'var(--color-danger-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fecaca',
            }}
          >
            <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--color-danger)' }}>
                Tindakan ini tidak dapat dibatalkan
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>
                Pengguna <strong>{user.name}</strong> ({user.email}) akan dihapus secara permanen.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            style={{ flex: 1 }}
          >
            Batal
          </button>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            style={{
              flex: 2,
              padding: '12px',
              background: 'var(--color-danger)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 900,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: deleteMutation.isPending ? 0.65 : 1,
              transition: 'all 0.15s',
            }}
          >
            {deleteMutation.isPending && <span className="spinner" />}
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Permanen'}
          </button>
        </div>
      </div>
    </div>
  )
}
