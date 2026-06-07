import { useState } from 'react'
import { functionalUpdate } from '@tanstack/react-table'
import type { ColumnFiltersState, PaginationState, SortingState, Updater } from '@tanstack/react-table'
import { useUsers } from './hooks/useUsers'
import { UsersSummary } from './components/UsersSummary'
import { UserFilters } from './components/UserFilters'
import { UsersTable } from './components/UsersTable'
import { UserForm } from './components/UserForm'
import { DeleteDialog } from './components/DeleteDialog'
import type { User } from '../../schemas/user.schema'

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers()

  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const handleColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((prev) => functionalUpdate(updater, prev))
  }
  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((prev) => functionalUpdate(updater, prev))
  }
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((prev) => functionalUpdate(updater, prev))
  }

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const openCreate = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const openEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSelectedUser(null)
  }

  const filteredCount = users.filter((u) => {
    const q = globalFilter.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const roleFilter = columnFilters.find((f) => f.id === 'role')?.value as string | undefined
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as string | undefined
    const matchRole = !roleFilter || u.role === roleFilter
    const matchStatus = !statusFilter || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  }).length

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Daftar <span style={{ color: 'var(--color-accent)' }}>Pengguna</span>
          </h1>
          <div className="page-subtitle">
            Total {isLoading ? '...' : filteredCount} Entitas Terdaftar
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <UsersSummary users={users} isLoading={isLoading} />

      {/* Filters */}
      <UserFilters
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        onAddUser={openCreate}
      />

      {/* Table */}
      <UsersTable
        users={users}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        columnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onEdit={openEdit}
        onDelete={(user) => setDeleteTarget(user)}
      />

      {/* Create / Edit Modal */}
      {isFormOpen && <UserForm user={selectedUser} onClose={closeForm} />}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteDialog user={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
