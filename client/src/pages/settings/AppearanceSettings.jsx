import { Sun, Moon, MonitorSmartphone } from 'lucide-react'
import { useTheme } from '@/app/ThemeProvider'
import { cn } from '@/utils/cn'

const options = [
  { key: 'light', label: 'Light', icon: Sun }, { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'auto', label: 'System', icon: MonitorSmartphone },
]

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="card p-6 max-w-lg">
      <h2 className="font-display font-semibold text-lg mb-4">Theme</h2>
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTheme(key)} className={cn('flex flex-col items-center gap-2 rounded-xl border px-4 py-5 transition-colors', theme === key ? 'border-current bg-current/10 text-current-2' : 'border-white/10 text-mist')}>
            <Icon size={20} /><span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
