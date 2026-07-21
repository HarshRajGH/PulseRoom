import { cn } from '@/utils/cn'

export default function Avatar({ name = '', gradient, src, size = 'md', ring = false, className }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-14 h-14 text-base', xl: 'w-24 h-24 text-2xl' }

  if (src) {
    return (
      <img
        src={src} alt={name}
        className={cn('rounded-full object-cover shrink-0', ring && 'ring-2 ring-current/50 ring-offset-2 ring-offset-ink', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-display font-semibold text-white shrink-0',
        ring && 'ring-2 ring-current/50 ring-offset-2 ring-offset-ink',
        sizes[size],
        className,
      )}
      style={{ background: gradient || 'linear-gradient(135deg,#7C5CFF,#FF7A45)' }}
    >
      {initials || '?'}
    </div>
  )
}
