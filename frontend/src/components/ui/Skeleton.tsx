interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: string
  className?: string
}

export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 'var(--radius-sm)',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: rounded,
      }}
    />
  )
}
