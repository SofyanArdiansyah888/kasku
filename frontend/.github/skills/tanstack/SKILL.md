---
name: tanstack
description: TanStack Router, Query, and Table patterns for this starter kit. Use when adding routes, data fetching, mutations, table features (sorting/filtering/pagination), or when reviewing code that uses @tanstack/react-router, @tanstack/react-query, or @tanstack/react-table.
---

# TanStack — Starter Kit Patterns

## Router: File-Based Routing

Route files live in `src/routes/`. The Vite plugin (`@tanstack/router-plugin/vite`) auto-generates `src/routeTree.gen.ts`.

### Naming Conventions
| File | URL | Notes |
|---|---|---|
| `index.tsx` | `/` | Root redirect |
| `_auth.tsx` + `_auth/login.tsx` | `/login` | `_` prefix = pathless layout |
| `_protected.tsx` + `_protected/dashboard/index.tsx` | `/dashboard` | auth guard |
| `_protected/users/$userId.tsx` | `/users/:userId` | dynamic segment |

### Auth Guard Pattern

```tsx
// src/routes/_protected.tsx
export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <AppLayout><Outlet /></AppLayout>,
})
```

### Router Context (pass React state to router)

```tsx
// src/router.ts
export interface RouterContext {
  auth: AuthContextType
}

export const router = createRouter({
  routeTree,
  context: { auth: undefined! as AuthContextType },
})

// src/main.tsx
function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}
```

### Navigation

```tsx
import { useNavigate, Link } from '@tanstack/react-router'

const navigate = useNavigate()
navigate({ to: '/dashboard' })
navigate({ to: '/users', search: { edit: userId } })

<Link to="/register">Daftar</Link>
```

### Route State (current path)

```tsx
import { useRouterState } from '@tanstack/react-router'
const { pathname } = useRouterState({ select: (s) => s.location })
```

---

## Query: Data Fetching & Mutations

```ts
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
})
```

### useQuery

```tsx
const { data: users = [], isLoading, isError } = useQuery({
  queryKey: ['users'],
  queryFn: mockApi.users.list,
})
```

### useMutation

```tsx
const createMutation = useMutation({
  mutationFn: (data: CreateUserInput) => mockApi.users.create(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
})

// Trigger with isPending:
await createMutation.mutateAsync(data)
createMutation.isPending // → true while running
```

### Invalidation After Mutation

```tsx
const queryClient = useQueryClient()
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] })
}
```

---

## Table: TanStack Table v8

### Setup

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    filterFn: 'equals', // exact match for Picker filter
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
  globalFilterFn: (row, _, value) => {
    const q = String(value).toLowerCase()
    return row.original.name.toLowerCase().includes(q)
      || row.original.email.toLowerCase().includes(q)
  },
})
```

### Render Table

```tsx
{table.getRowModel().rows.map((row) => (
  <tr key={row.id}>
    {row.getVisibleCells().map((cell) => (
      <td key={cell.id}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </td>
    ))}
  </tr>
))}
```

### Sortable Header

```tsx
<th onClick={header.column.getToggleSortingHandler()}>
  {flexRender(header.column.columnDef.header, header.getContext())}
  {header.column.getIsSorted() === 'asc' && <ChevronUp />}
  {header.column.getIsSorted() === 'desc' && <ChevronDown />}
</th>
```

### Pagination

```tsx
table.getCanPreviousPage()  // boolean
table.getCanNextPage()      // boolean
table.previousPage()
table.nextPage()
table.setPageIndex(0)
table.getPageCount()
table.getState().pagination // { pageIndex, pageSize }
```

### Column Filter (from external select)

```tsx
// Set filter
table.getColumn('role')?.setFilterValue('Editor')
// Clear filter
table.getColumn('role')?.setFilterValue(undefined)
```
