import { Skeleton } from '../../../components/ui/Skeleton'

export function StatsCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton width={44} height={44} rounded="var(--radius-md)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width="60%" height={10} rounded="var(--radius-sm)" />
        <Skeleton width="40%" height={26} rounded="var(--radius-sm)" />
      </div>
    </div>
  )
}
