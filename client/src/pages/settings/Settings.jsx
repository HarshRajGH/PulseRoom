import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/utils/cn'

const tabs = [
  ['/app/settings', 'Account'], ['/app/settings/security', 'Security'],
  ['/app/settings/appearance', 'Appearance'], ['/app/settings/privacy', 'Privacy'],
  ['/app/settings/blocked', 'Blocked users'],
]

export default function Settings() {
  return (
    <div>
      <p className="heading-eyebrow mb-1">Settings</p>
      <h1 className="font-display text-3xl font-bold mb-6">Manage your account</h1>
      <div className="flex gap-6">
        <nav className="w-44 shrink-0 space-y-1 hidden sm:block">
          {tabs.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/app/settings'} className={({ isActive }) => cn('block rounded-xl px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-current/15 text-current-2' : 'text-mist hover:text-paper hover:bg-white/5')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 min-w-0"><Outlet /></div>
      </div>
    </div>
  )
}
