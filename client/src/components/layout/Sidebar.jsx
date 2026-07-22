import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Compass, Search, Radio, ListMusic, Library, User,
  Settings, Shield, LineChart, Wallet, ChevronsLeft, LogOut, X,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar, closeMobileSidebar } from '@/store/slices/uiSlice'
import { cn } from '@/utils/cn'
import EqBars from '@/components/ui/EqBars'
import { useAuth } from '@/app/AuthProvider'
import { ROLES } from '@/utils/roles'

const nav = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/discover', label: 'Discover', icon: Compass },
  { to: '/app/search', label: 'Search', icon: Search },
  { to: '/app/rooms', label: 'Rooms', icon: Radio },
  { to: '/app/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/app/library', label: 'Library', icon: Library },
]

/** Shared inner content for both desktop sidebar and mobile drawer */
function SidebarContent({ collapsed, onClose }) {
  const user = useSelector((s) => s.auth.user)
  const dispatch = useDispatch()
  const { logout } = useAuth()

  const navBottom = [
    ...(user?.role === ROLES.CREATOR || user?.role === ROLES.HOST || user?.role === ROLES.ADMIN
      ? [{ to: '/app/creator', label: 'Creator Studio', icon: LineChart }] : []),
    { to: '/app/wallet', label: 'Wallet', icon: Wallet },
    { to: '/app/profile', label: 'Profile', icon: User },
    { to: '/app/settings', label: 'Settings', icon: Settings },
    ...(user?.role === ROLES.ADMIN ? [{ to: '/app/admin', label: 'Admin', icon: Shield }] : []),
  ]

  const linkCls = ({ isActive }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      isActive ? 'bg-current/15 text-current-2' : 'text-mist hover:text-paper hover:bg-white/5',
    )

  return (
    <>
      {/* Logo row */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-current/15 flex items-center justify-center shrink-0">
          <EqBars size="sm" />
        </div>
        {!collapsed && <span className="font-display font-bold text-lg tracking-tight">SyncWave</span>}
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-mist hover:text-paper hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}   // close mobile drawer on navigate
            className={linkCls}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 pt-4 border-t border-white/[0.06]">
        {navBottom.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={linkCls}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
        <button
          onClick={() => { logout(); onClose?.() }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-mist hover:text-ember-2 hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        {/* Desktop-only collapse toggle */}
        {!onClose && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-mist hover:text-paper hover:bg-white/5 transition-colors"
          >
            <ChevronsLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </>
  )
}

export default function Sidebar() {
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const mobileOpen = useSelector((s) => s.ui.mobileSidebarOpen)
  const dispatch = useDispatch()

  const closeMobile = () => dispatch(closeMobileSidebar())

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col shrink-0 glass border-r border-white/[0.06] h-screen sticky top-0 py-6 px-3 overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} onClose={null} />
      </motion.aside>

      {/* ── Mobile sidebar drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={closeMobile}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-[60] w-72 flex flex-col glass-solid border-r border-white/[0.06] py-6 px-3 overflow-y-auto"
            >
              <SidebarContent collapsed={false} onClose={closeMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
