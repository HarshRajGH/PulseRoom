import { useNavigate } from 'react-router-dom'
import { Search, Bell, MessageSquare, Command, Menu } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import ThemeSwitch from '@/components/ui/ThemeSwitch'
import Avatar from '@/components/ui/Avatar'
import { useListNotificationsQuery } from '@/services/notification.api'
import { useUnreadDmCountQuery } from '@/services/conversation.api'
import { toggleMobileSidebar } from '@/store/slices/uiSlice'

export default function Topbar({ onOpenPalette }) {
  const user = useSelector((s) => s.auth.user)
  const dispatch = useDispatch()
  const { data } = useListNotificationsQuery({ limit: 1 }, { pollingInterval: 30000 })
  const { data: dmUnread } = useUnreadDmCountQuery(undefined, { pollingInterval: 20000 })
  const unread = data?.unreadCount || 0
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 glass border-b border-white/[0.06] px-4 lg:px-6 py-3.5">
      {/* Hamburger — only visible on mobile/tablet (< lg) */}
      <button
        onClick={() => dispatch(toggleMobileSidebar())}
        className="lg:hidden p-1.5 -ml-1 rounded-xl text-mist hover:text-paper hover:bg-white/5 transition-colors shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Search / command palette trigger */}
      <button
        onClick={onOpenPalette}
        className="flex flex-1 max-w-md items-center gap-2.5 rounded-full bg-surface-2 px-4 py-2 text-sm text-mist hover:text-paper transition-colors"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search songs, rooms, people…</span>
        <span className="hidden sm:flex items-center gap-0.5 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-mono">
          <Command size={10} />K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitch />
        <button onClick={() => navigate('/app/messages')} className="relative p-2 rounded-full text-mist hover:text-paper hover:bg-white/5 transition-colors">
          <MessageSquare size={18} />
          {dmUnread?.count > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ember" />}
        </button>
        <button onClick={() => navigate('/app/notifications')} className="relative p-2 rounded-full text-mist hover:text-paper hover:bg-white/5 transition-colors">
          <Bell size={18} />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ember" />}
        </button>
        <button onClick={() => navigate('/app/profile')}>
          <Avatar name={user?.name || '?'} src={user?.avatarUrl} size="sm" ring />
        </button>
      </div>
    </header>
  )
}
