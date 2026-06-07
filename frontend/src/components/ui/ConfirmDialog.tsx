import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void | Promise<void>
  isPending?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  onClose,
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onCloseRef.current()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, isPending])

  if (!open) return null

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <div className="modal-overlay" onClick={isPending ? undefined : onClose} role="presentation">
      <div
        className="modal-container"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="modal-header">
          <span className="modal-title" id="confirm-title">{title}</span>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" id="confirm-desc">
          <div className="confirm-dialog-warning">
            <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div className="confirm-dialog-warning-title">Tindakan ini tidak dapat dibatalkan</div>
              <div className="confirm-dialog-warning-text">{description}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isPending}
            style={{ flex: 1 }}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={isPending}
            onClick={handleConfirm}
            style={{ flex: 2 }}
          >
            {isPending && <span className="spinner" />}
            {isPending ? 'Menghapus...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
