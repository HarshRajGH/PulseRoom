import { cn } from '@/utils/cn'

export default function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'card p-5',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glow hover:border-current/30',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
