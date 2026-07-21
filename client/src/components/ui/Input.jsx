import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Input = forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-mist/70 focus:border-current/60',
          Icon && 'pl-10',
          error && 'border-ember/60',
          className,
        )}
        {...props}
      />
    </div>
    {error && <span className="mt-1 block text-xs text-ember-2">{error}</span>}
  </label>
))
Input.displayName = 'Input'
export default Input
