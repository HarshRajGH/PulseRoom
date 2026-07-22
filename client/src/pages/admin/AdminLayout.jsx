import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Radio, Flag, ShieldAlert, Music } from 'lucide-react'
import { cn } from '@/utils/cn'

const tabs = [
  ['/app/admin', 'Overview', LayoutDashboard], ['/app/admin/users', 'Users', Users],
  ['/app/admin/rooms', 'Rooms', Radio], ['/app/admin/reports', 'Reported messages', Flag],
  ['/app/admin/moderation', 'Moderation', ShieldAlert],
  ['/app/admin/verification', 'Verification Queue', Music],
]

export default function AdminLayout() {
  return (
    <div>
      <p className="heading-eyebrow mb-1">Admin</p>
      <h1 className="font-display text-3xl font-bold mb-6">Platform overview</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === '/app/admin'} className={({ isActive }) => cn('flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors', isActive ? 'bg-current text-white' : 'bg-surface-2 text-mist hover:text-paper')}>
            <Icon size={13} />{label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
