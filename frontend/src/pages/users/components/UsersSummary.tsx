import { Users, UserCheck, UserMinus, ShieldCheck } from 'lucide-react'
import type { User } from '../../../schemas/user.schema'
import { StatsCard } from '../../dashboard/components/StatsCard'
import { UsersSummarySkeleton } from './UsersSummarySkeleton'

interface UsersSummaryProps {
  users: User[]
  isLoading: boolean
}

export function UsersSummary({ users, isLoading }: UsersSummaryProps) {
  if (isLoading) return <UsersSummarySkeleton />

  const total = users.length
  const active = users.filter((u) => u.status === 'Aktif').length
  const inactive = users.filter((u) => u.status === 'Nonaktif').length
  const admins = users.filter((u) => u.role === 'Superadmin').length

  const stats = [
    {
      label: 'Total Pengguna',
      value: total,
      icon: Users,
      iconColor: 'white',
      iconBg: 'black',
    },
    {
      label: 'Aktif',
      value: active,
      icon: UserCheck,
      iconColor: 'var(--color-success)',
      iconBg: 'var(--color-success-bg)',
    },
    {
      label: 'Nonaktif',
      value: inactive,
      icon: UserMinus,
      iconColor: 'var(--color-danger)',
      iconBg: 'var(--color-danger-bg)',
    },
    {
      label: 'Superadmin',
      value: admins,
      icon: ShieldCheck,
      iconColor: 'var(--color-purple)',
      iconBg: 'var(--color-purple-bg)',
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <StatsCard key={s.label} {...s} />
      ))}
    </div>
  )
}
