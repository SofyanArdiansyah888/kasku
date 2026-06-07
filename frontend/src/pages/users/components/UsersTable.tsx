import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { User } from '../../../schemas/user.schema'

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => void
  sorting: SortingState
  onSortingChange: (updater: Updater<SortingState>) => void
  pagination: PaginationState
  onPaginationChange: (updater: Updater<PaginationState>) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const SKELETON_ROWS = 5

export function UsersTable({
  users,
  isLoading,
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Nama & Identitas',
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            {row.original.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, marginTop: 2 }}>
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => <span className="role-badge">{getValue<string>()}</span>,
      filterFn: 'equals',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const val = getValue<string>()
        return (
          <div className="status-row">
            <span className={`status-dot ${val === 'Aktif' ? 'active' : 'inactive'}`} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: val === 'Aktif' ? '#15803d' : 'var(--color-text-muted)',
              }}
            >
              {val}
            </span>
          </div>
        )
      },
      filterFn: 'equals',
    },
    {
      id: 'actions',
      header: () => <span style={{ float: 'right' }}>Aksi</span>,
      cell: ({ row }) => (
        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
          <button className="icon-btn" onClick={() => onEdit(row.original)} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(row.original)} title="Hapus">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter, columnFilters, sorting, pagination },
    onGlobalFilterChange,
    onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).toLowerCase()
      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.email.toLowerCase().includes(q)
      )
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const firstRow = pageIndex * pageSize + 1
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="table-wrapper">
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'sort-header' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp size={12} />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown size={12} />}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Skeleton height={13} width="65%" />
                        <Skeleton height={10} width="45%" />
                      </div>
                    </td>
                    <td><Skeleton height={20} width={70} rounded="var(--radius-sm)" /></td>
                    <td><Skeleton height={12} width={60} /></td>
                    <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><Skeleton height={12} width={40} /></div></td>
                  </tr>
                ))
              : table.getRowModel().rows.length === 0
              ? (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">Data Tidak Ditemukan</div>
                  </td>
                </tr>
              )
              : table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && totalRows > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Menampilkan {firstRow}–{lastRow} dari {totalRows} data
          </div>

          <button
            className="page-btn"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            className="page-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => (
            <button
              key={page}
              className={`page-btn ${pageIndex === page ? 'active' : ''}`}
              onClick={() => table.setPageIndex(page)}
            >
              {page + 1}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={14} />
          </button>
          <button
            className="page-btn"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
