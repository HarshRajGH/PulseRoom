import { cn } from '@/utils/cn'

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1 rounded-full bg-surface-2 p-1 w-fit', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
            active === tab.value ? 'bg-current text-white' : 'text-mist hover:text-paper',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
