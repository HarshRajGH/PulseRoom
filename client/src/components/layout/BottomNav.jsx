import { NavLink } from 'react-router-dom'
import { Home, Compass, Radio, ListMusic, User } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/discover', label: 'Discover', icon: Compass },
  { to: '/app/rooms', label: 'Rooms', icon: Radio },
  { to: '/app/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/app/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-solid border-t border-white/[0.06] flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn('flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium', isActive ? 'text-current-2' : 'text-mist')}
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
