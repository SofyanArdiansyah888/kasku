import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { dashboardApi } from '../../lib/api/laporan'
import { formatRupiah } from '../../lib/api-client'
import { StatsCard } from './components/StatsCard'
import { StatsCardSkeleton } from './components/StatsCardSkeleton'
import { RecentActivity } from './components/RecentActivity'

export function DashboardPage() {
  const { data: ringkasan, isLoading } = useQuery({
    queryKey: ['dashboard-ringkasan'],
    queryFn: dashboardApi.ringkasan,
  })

  const stats = [
    {
      label: 'Total Saldo',
      value: ringkasan ? formatRupiah(ringkasan.totalSaldo) : '-',
      icon: Wallet,
      iconColor: 'white',
      iconBg: 'black',
    },
    {
      label: 'Pemasukan Bulan Ini',
      value: ringkasan ? formatRupiah(ringkasan.pemasukanBulanIni) : '-',
      icon: TrendingUp,
      iconColor: 'var(--color-success)',
      iconBg: 'var(--color-success-bg)',
    },
    {
      label: 'Pengeluaran Bulan Ini',
      value: ringkasan ? formatRupiah(ringkasan.pengeluaranBulanIni) : '-',
      icon: TrendingDown,
      iconColor: 'var(--color-danger)',
      iconBg: 'var(--color-danger-bg)',
    },
    {
      label: 'Jumlah Transaksi',
      value: ringkasan?.jumlahTransaksi ?? '-',
      icon: Receipt,
      iconColor: 'var(--color-purple)',
      iconBg: 'var(--color-purple-bg)',
    },
  ]

  return (
    <div>
      <div className="stats-grid">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : stats.map((s) => <StatsCard key={s.label} {...s} />)}
      </div>
      <div style={{ marginTop: 32 }}>
        <RecentActivity />
      </div>
    </div>
  )
}
