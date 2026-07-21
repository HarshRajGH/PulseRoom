import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-current text-white shadow-glow hover:bg-current-2',
  ember: 'bg-ember text-white shadow-emberglow hover:bg-ember-2',
  ghost: 'border border-white/10 text-paper/90 hover:bg-white/5 light:border-black/10',
  subtle: 'bg-surface-2 text-paper hover:bg-surface-3',
  link: 'text-current-2 hover:underline px-0',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
  icon: 'p-2.5',
}

const Button = forwardRef(({ className, variant = 'primary', size = 'md', as: Comp = 'button', children, ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  >
    {children}
  </Comp>
))
Button.displayName = 'Button'
export default Button
