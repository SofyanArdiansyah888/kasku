import { Skeleton } from '../../../components/ui/Skeleton'

export function UsersSummarySkeleton() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-card">
          <Skeleton width={44} height={44} rounded="var(--radius-md)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="55%" height={10} rounded="var(--radius-sm)" />
            <Skeleton width="35%" height={24} rounded="var(--radius-sm)" />
          </div>
        </div>
      ))}
    </div>
  )
}
