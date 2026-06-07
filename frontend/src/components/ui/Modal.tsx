import { useEffect, useRef, type FormEventHandler, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  onSubmit?: FormEventHandler<HTMLFormElement>
  size?: 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, onSubmit, size = 'md' }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!open) return null

  const content = (
    <>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button
          ref={closeRef}
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </>
  )

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      {onSubmit ? (
        <form
          className={`modal-container modal-container--${size}`}
          onClick={(e) => e.stopPropagation()}
          onSubmit={onSubmit}
          role="dialog"
          aria-modal="true"
        >
          {content}
        </form>
      ) : (
        <div
          className={`modal-container modal-container--${size}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {content}
        </div>
      )}
    </div>
  )
}
