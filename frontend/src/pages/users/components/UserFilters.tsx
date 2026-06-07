import { Search, Filter, Plus } from 'lucide-react'
import type { ColumnFiltersState } from '@tanstack/react-table'

interface UserFiltersProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: (filters: ColumnFiltersState) => void
  onAddUser: () => void
}

export function UserFilters({
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  onAddUser,
}: UserFiltersProps) {
  const roleFilter = (columnFilters.find((f) => f.id === 'role')?.value as string) ?? ''
  const statusFilter = (columnFilters.find((f) => f.id === 'status')?.value as string) ?? ''

  const setFilter = (id: string, value: string) => {
    onColumnFiltersChange(
      value
        ? [
            ...columnFilters.filter((f) => f.id !== id),
            { id, value },
          ]
        : columnFilters.filter((f) => f.id !== id),
    )
  }

  return (
    <div className="filter-bar">
      <div className="search-wrapper">
        <Search size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="Cari nama atau email..."
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Filter size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setFilter('role', e.target.value)}
        >
          <option value="">Semua Peran</option>
          <option value="Superadmin">Superadmin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      <select
        className="filter-select"
        value={statusFilter}
        onChange={(e) => setFilter('status', e.target.value)}
      >
        <option value="">Semua Status</option>
        <option value="Aktif">Aktif</option>
        <option value="Nonaktif">Nonaktif</option>
      </select>

      <div className="filter-spacer" />

      <button className="btn btn-primary" onClick={onAddUser}>
        <Plus size={16} />
        Tambah User
      </button>
    </div>
  )
}
