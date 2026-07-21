import Skeleton from './Skeleton'

export function CardSkeletonGrid({ count = 6, className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3">
          <Skeleton className="aspect-square rounded-xl mb-3" />
          <Skeleton className="h-3.5 w-4/5 mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function RowSkeletonList({ count = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
