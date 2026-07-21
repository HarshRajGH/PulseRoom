import { Sun, Moon, MonitorSmartphone } from 'lucide-react'
import { useTheme } from '@/app/ThemeProvider'
import { cn } from '@/utils/cn'

const options = [
  { key: 'light', icon: Sun }, { key: 'dark', icon: Moon }, { key: 'auto', icon: MonitorSmartphone },
]

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
      {options.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          aria-label={`${key} theme`}
          className={cn(
            'p-1.5 rounded-full transition-colors',
            theme === key ? 'bg-current text-white' : 'text-mist hover:text-paper',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
