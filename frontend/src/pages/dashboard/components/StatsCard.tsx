import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

export function StatsCard({ label, value, icon: Icon, iconColor, iconBg }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div className="label-text" style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>
          {label}
        </div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )
}
