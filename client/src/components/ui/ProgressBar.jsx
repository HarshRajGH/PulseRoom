import { cn } from '@/utils/cn'

export default function ProgressBar({ value = 0, className, color = 'current' }) {
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-white/10 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', color === 'ember' ? 'bg-ember' : 'bg-current')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
