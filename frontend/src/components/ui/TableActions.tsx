import { Pencil, Trash2 } from 'lucide-react'

interface TableActionsProps {
  onEdit?: () => void
  onDelete: () => void
  hideEdit?: boolean
}

export function TableActions({ onEdit, onDelete, hideEdit }: TableActionsProps) {
  return (
    <div className="table-actions">
      {!hideEdit && onEdit && (
        <button type="button" className="btn-icon btn-icon--edit" onClick={onEdit} title="Edit">
          <Pencil size={16} />
        </button>
      )}
      <button type="button" className="btn-icon btn-icon--danger" onClick={onDelete} title="Hapus">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
