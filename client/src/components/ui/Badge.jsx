import { cn } from '@/utils/cn'

const variants = {
  live: 'bg-ember/15 text-ember-2 border-ember/30',
  current: 'bg-current/15 text-current-2 border-current/30',
  neutral: 'bg-surface-3 text-mist border-white/10',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

export default function Badge({ children, variant = 'neutral', dot = false, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', variants[variant], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  )
}
