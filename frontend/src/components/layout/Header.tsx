import { ChevronRight } from 'lucide-react'
import { useRouterState } from '@tanstack/react-router'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Ringkasan',
  '/transaksi': 'Transaksi',
  '/dompet': 'Dompet',
  '/kategori': 'Kategori',
  '/anggaran': 'Anggaran',
  '/transaksi-berulang': 'Transaksi Berulang',
  '/laporan': 'Laporan',
}

export function Header() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const label =
    Object.entries(routeLabels).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Kasku'

  return (
    <header className="app-header">
      <div className="breadcrumb">
        <span>Kasku</span>
        <ChevronRight size={12} style={{ color: 'var(--color-accent)' }} />
        <span className="breadcrumb-current">{label}</span>
      </div>
    </header>
  )
}
